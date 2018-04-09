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

const LessMoreByTimestamp = function ($http, $q, params) {
	this.$http = $http;
	this.$q = $q;

	this.url = params.url || '';
	this.parent = params.parent || 'parent';
	this.key = params.key || '';
	this.timestamp = params.timestamp || 0;
	this.maximum = params.maximum || 2000;
	this.limit = params.limit || 50;

	['url', 'parent', 'key', 'timestamp', 'maximum', 'limit'].forEach((key) => {
		delete params[key];
	});

	this.params = params;
	this.results = [];
	this.splice = 0;
	this.loading = true;
	this.moreData = false;
	this.lessData = false;
};

LessMoreByTimestamp.prototype.getLastItem = function () {
	return this.results[this.results.length - 1];
};

LessMoreByTimestamp.prototype.disable = function () {
	this.moreData = false;
	this.lessData = false;
};

LessMoreByTimestamp.prototype.disabled = function () {
	return !this.moreData && !this.lessData;
};

LessMoreByTimestamp.prototype.getData = function (timestamp, limit, cb) {
	const params = Object.assign({}, { timestamp, limit }, this.params);
	this.disable();
	this.loading = true;

	if (timestamp === 0) {
		params.timestampQuery = 'fromTimestamp';
	}

	this.$http.get(this.url, {
		params,
	}).then((resp) => {
		if (resp.data.success && angular.isArray(resp.data[this.key])) {
			cb(resp.data[this.key]);
		} else {
			throw new Error('LessMoreByTimestamp failed to get valid response data');
		}
	});
};

LessMoreByTimestamp.prototype.anyMore = function (length) {
	return (this.limit <= 1 && (this.limit % length) === 1) ||
		(length > 1 && this.limit >= 1 && (length % this.limit) === 1);
};

LessMoreByTimestamp.prototype.spliceData = function (data) {
	if (this.anyMore(angular.isArray(data) ? data.length : 0)) {
		this.moreData = true;
		data.splice(-1, 1);
	} else {
		this.moreData = false;
	}
};

LessMoreByTimestamp.prototype.acceptData = function (data) {
	if (!angular.isArray(data)) { data = []; }

	this.spliceData(data);

	if (this.results.length > 0) {
		data.forEach((transaction) => {
			const pos = this.results.map(e => e.id).indexOf(transaction.id);
			if (pos < 0) {
				this.results.push(transaction);
			}
		});
	} else {
		this.results = data;
	}

	if ((this.results.length + this.limit) > this.maximum) {
		this.moreData = false;
	}

	this.lessData = this.anyLess(this.results.length);
	this.loading = false;
	delete this.params.recipientOffset;
	delete this.params.senderOffset;
	this.updateTimestamp();
};

LessMoreByTimestamp.prototype.loadData = function () {
	this.getData(0, (this.limit + 1),
		(data) => {
			this.acceptData(data);
		});
};

LessMoreByTimestamp.prototype.loadMore = function () {
	const { params } = this;
	const lastItems = this.results.filter(item => item.timestamp === this.timestamp);
	params.recipientOffset = lastItems.filter(item => item.recipientId === params.address).length;
	params.senderOffset = lastItems.filter(item => item.senderId === params.address).length;
	params.timestampQuery = 'toTimestamp';
	this.getData(this.timestamp, (this.limit + 1),
		(data) => {
			this.acceptData(data);
		});
};

LessMoreByTimestamp.prototype.reloadMore = function () {
	this.params.timestampQuery = 'fromTimestamp';
	this.getData(this.timestamp, (this.limit + 1),
		(data) => {
			this.acceptData(data);
		});
	return true;
};

LessMoreByTimestamp.prototype.updateTimestamp = function () {
	this.timestamp = this.getLastItem().timestamp;
	return this.timestamp;
};

LessMoreByTimestamp.prototype.anyLess = function (length) {
	if (length > this.limit) {
		const mod = length % this.limit;
		this.splice = (mod === 0) ? this.limit : mod;
		return true;
	}
	this.splice = 0;
	return false;
};

LessMoreByTimestamp.prototype.loadLess = function () {
	this.lessData = false;
	this.moreData = true;
	if (angular.isArray(this.results)) {
		this.results.splice(-this.splice, this.splice);
		this.lessData = this.anyLess(this.results.length);
	}
	this.updateTimestamp();
};

AppServices.factory('lessMoreByTimestamp',
	($http, $q) => params => new LessMoreByTimestamp($http, $q, params));

export default LessMoreByTimestamp;
