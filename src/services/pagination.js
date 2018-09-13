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

const Pagination = function ($http, $q, params) {
	this.$http = $http;
	this.$q = $q;

	this.url = params.url || '';
	this.parent = params.parent || 'parent';
	this.key = params.key || '';
	this.offset = Number(params.offset) || 0;
	this.currentPage = Number(params.currentPage) || 1;
	this.limit = Number(params.limit) || 50;

	['url', 'parent', 'key', 'offset', 'limit'].forEach((key) => {
		delete params[key];
	});

	this.params = params;
	this.results = [];
	this.splice = 0;
	this.loading = true;
	this.hasNext = false;
	this.hasPrev = false;
};

Pagination.prototype.disable = function () {
	this.hasNext = false;
	this.hasPrev = false;
};

Pagination.prototype.disabled = function () {
	return !this.hasNext && !this.hasPrev;
};

Pagination.prototype.getData = function (offset, limit, cb) {
	const params = Object.assign({}, { offset, limit }, this.params);
	this.disable();
	this.loading = true;
	this.$http.get(this.url, { params }).then((resp) => {
		if (resp.data.success && angular.isArray(resp.data[this.key])) {
			cb(resp.data[this.key]);
		} else {
			cb(null);
		}
	}).catch(() => {
		cb(null);
	});
};

Pagination.prototype.anyMore = function (length) {
	return (this.limit <= 1 && (this.limit % length) === 1) ||
		(length > 1 && this.limit >= 1 && (length % this.limit) === 1);
};

Pagination.prototype.spliceData = function (data) {
	this.hasPrev = this.currentPage > 1;

	if (this.anyMore(angular.isArray(data) ? data.length : 0)) {
		this.hasNext = true;
		data.splice(-1, 1);
	} else {
		this.hasNext = false;
	}
};

Pagination.prototype.concatNoDuplicates = function (data) {
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

Pagination.prototype.loadData = function () {
	this.results = [];
	this.getData(this.offset, (this.limit + 1),
		(data) => {
			if (!angular.isArray(data)) { data = []; }
			this.spliceData(data);
			this.results = data;
			this.loading = false;
		});
};

Pagination.prototype.loadNext = function () {
	this.nextOffset();
	this.loadData();
};

Pagination.prototype.loadPrev = function () {
	this.prevOffset();
	this.loadData();
};

Pagination.prototype.reloadMore = function () {
	const maxOffset = (this.offset + this.limit);
	const promises = [];
	const self = this;

	self.offset = 0;
	self.results = [];

	for (let o = 0; o < maxOffset; o += self.limit) {
		const params = angular.extend({ offset: o, limit: self.limit }, self.params);
		promises.push(self.$http.get(self.url, { params }));
	}

	self.$q.all(promises).then((responses) => {
		angular.forEach(responses, function (resp) {
			if (resp.data.success && angular.isArray(resp.data[this.key])) {
				self.acceptData(resp.data[self.key]);
			} else {
				throw new Error('Pagination failed to reload results on change');
			}
		});
	});
};

Pagination.prototype.nextOffset = function () {
	this.currentPage += 1;
	return this.offset += this.limit;
};

Pagination.prototype.prevOffset = function () {
	this.currentPage -= 1;
	return this.offset -= this.limit;
};

Pagination.prototype.anyLess = function () {
	return this.offset > 0;
};

AppServices.factory('pagination',
	($http, $q) => params => new Pagination($http, $q, params));

export default Pagination;
