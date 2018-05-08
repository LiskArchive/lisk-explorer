/*
 * LiskHQ/lisk-explorer
 * Copyright © 2018 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 *
 */
import angular from 'angular';
import AppServices from './services.module';

const LessMore = function ($http, $q, params) {
	this.$http = $http;
	this.$q = $q;

	this.url = params.url || '';
	this.parent = params.parent || 'parent';
	this.key = params.key || '';
	this.offset = params.offset || 0;
	this.maximum = params.maximum || 2000;
	this.limit = params.limit || 50;

	['url', 'parent', 'key', 'offset', 'maximum', 'limit'].forEach((key) => {
		delete params[key];
	});

	this.params = params;
	this.results = [];
	this.splice = 0;
	this.loading = true;
	this.moreData = false;
	this.lessData = false;
};

LessMore.prototype.disable = function () {
	this.moreData = false;
	this.lessData = false;
};

LessMore.prototype.disabled = function () {
	return !this.moreData && !this.lessData;
};

LessMore.prototype.getData = function (offset, limit, cb) {
	const params = Object.assign({}, { offset, limit }, this.params);
	this.disable();
	this.loading = true;
	this.$http.get(this.url, {
		params,
	}).then((resp) => {
		if (resp.data.success && angular.isArray(resp.data[this.key])) {
			cb(resp.data[this.key]);
		} else {
			throw new Error('LessMore failed to get valid response data');
		}
	});
};

LessMore.prototype.anyMore = function (length) {
	return (this.limit <= 1 && (this.limit % length) === 1) ||
		(length > 1 && this.limit >= 1 && (length % this.limit) === 1);
};

LessMore.prototype.spliceData = function (data) {
	if (this.anyMore(angular.isArray(data) ? data.length : 0)) {
		this.moreData = true;
		data.splice(-1, 1);
	} else {
		this.moreData = false;
	}
};

LessMore.prototype.concatNoDuplicates = function (data) {
	if (this.key === 'transactions') {
		data.forEach((transaction) => {
			const pos = this.results.map(e => e.id).indexOf(transaction.id);
			if (pos < 0) {
				this.results.push(transaction);
			}
		});
	} else {
		this.results = this.results.concat(data);
	}
};

LessMore.prototype.acceptData = function (data) {
	if (!angular.isArray(data)) { data = []; }

	this.spliceData(data);

	if (this.results.length > 0) {
		this.concatNoDuplicates(data);
	} else {
		this.results = data;
	}

	if ((this.results.length + this.limit) > this.maximum) {
		this.moreData = false;
	}

	this.lessData = this.anyLess(this.results.length);
	this.loading = false;
	this.nextOffset();
};

LessMore.prototype.loadData = function () {
	this.getData(0, (this.limit + 1),
		(data) => {
			this.acceptData(data);
		});
};

LessMore.prototype.loadMore = function () {
	this.getData(this.offset, (this.limit + 1),
		(data) => {
			this.acceptData(data);
		});
};

LessMore.prototype.reloadMore = function () {
	const maxOffset = (this.offset + this.limit);
	const promises = [];
	const self = this;

	self.offset = 0;
	self.results = [];

	for (let o = 0; o < maxOffset; o += self.limit) {
		const params = angular.extend({ offset: o, limit: self.limit + 1 }, self.params);
		promises.push(self.$http.get(self.url, { params }));
	}

	self.$q.all(promises).then((responses) => {
		angular.forEach(responses, function (resp) {
			if (resp.data.success && angular.isArray(resp.data[this.key])) {
				self.acceptData(resp.data[self.key]);
			} else {
				throw new Error('LessMore failed to reload results on change');
			}
		});
	});
};

LessMore.prototype.nextOffset = function () {
	return this.offset += this.limit;
};

LessMore.prototype.prevOffset = function () {
	return this.offset -= this.limit;
};

LessMore.prototype.anyLess = function (length) {
	if (length > this.limit) {
		const mod = length % this.limit;
		this.splice = (mod === 0) ? this.limit : mod;
		return true;
	}
	this.splice = 0;
	return false;
};

LessMore.prototype.loadLess = function () {
	this.lessData = false;
	this.moreData = true;
	if (angular.isArray(this.results)) {
		this.results.splice(-this.splice, this.splice);
		this.lessData = this.anyLess(this.results.length);
	}
	this.prevOffset();
};

AppServices.factory('lessMore',
	($http, $q) => params => new LessMore($http, $q, params));

export default LessMore;
