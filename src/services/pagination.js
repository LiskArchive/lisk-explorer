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

	this.url = params.url || '/api/getTransactions';
	this.parent = params.parent || 'parent';
	this.key = params.key || '';
	this.offset = Number(params.offset) || 0;
	this.page = Number(params.page) || 1;
	this.limit = Number(params.limit) || 20;

	this.params = params;
	this.disablePagination = params.disablePagination || false;
	this.results = [];
	this.loading = true;
	this.hasNext = false;
	this.hasNextNext = false;
	this.hasPrev = false;
};

const availableSearchParams = [
	{ key: 'senderId', name: 'Sender ID', placeholder: 'Sender...', example: '12317412804123L', visible: ['transactions'] },
	{ key: 'senderPublicKey', name: 'Sender Public Key', placeholder: 'Sender Public Key...', example: 'b550ede5...a26c78d8', visible: ['transactions'] },
	{ key: 'recipientId', name: 'Recipient ID', placeholder: 'Recipient...', example: '12317412804123L', visible: ['transactions'] },
	{ key: 'recipientPublicKey', name: 'Recipient Public Key', placeholder: 'Recipient Public Key...', example: 'b550ede5...a26c78d8', visible: ['transactions'] },
	{ key: 'minAmount', name: 'Min Amount', placeholder: 'Min Amount...', example: '1.25', visible: ['transactions', 'address'] },
	{ key: 'maxAmount', name: 'Max Amount', placeholder: 'Max Amount...', example: '1000.5', visible: ['transactions', 'address'] },
	{ key: 'type', name: 'Comma separated transaction types', placeholder: 'Comma separated...', example: '1,3', visible: ['transactions', 'address'] },
	{ key: 'height', name: 'Block height', placeholder: 'Block Height...', example: '2963014', visible: ['transactions', 'address'] },
	{ key: 'blockId', name: 'Block Id', placeholder: 'Block Id...', example: '17238091754034756025', visible: ['transactions', 'address'] },

	// { key: 'fromTimestamp', name: 'From', placeholder: 'From...', example: '' },
	// { key: 'toTimestamp', name: 'To', placeholder: 'To...', example: '' },
	// { key: 'limit', name: 'Limit', placeholder: 'Limit...', example: '12317412804123L' },
	// { key: 'offset', name: 'Offset', placeholder: 'Offset...', example: '12317412804123L' },
	{
		key: 'sort',
		name: 'Order By',
		placeholder: 'Order By...',
		visible: [],
		restrictToSuggestedValues: true,
		suggestedValues: ['amount:asc', 'amount:desc', 'fee:asc', 'fee:desc', 'type:asc',
			'type:desc', 'timestamp:asc', 'timestamp:desc'],
	},
];

Pagination.prototype.getData = function () {
	this.loading = true;

	const searchParams = availableSearchParams.reduce((obj, item) => {
		obj[item.key] = item.key;
		return obj;
	}, {});

	const filters = this.params.filters.reduce((obj, item) => {
		obj[searchParams[item.key]] = item.value;
		return obj;
	}, {});
	const requestLimit = (this.limit * 2) + 1;
	const offset = (this.page - 1) * this.limit;

	const requestParams = Object.assign({ limit: requestLimit, offset }, filters);

	return this.$http.get(this.url, { params: requestParams }).then((resp) => {
		if (resp.data.success) {
			this.results = resp.data.transactions.slice(0, this.limit);
			this.pagination = resp.data.pagination;
			this.numberOfPages = Math.ceil(this.pagination.count / this.limit);
			this.hasPrev = !!offset;

			if (resp.data.transactions.length > requestLimit) {
				this.hasNextNext = true;
				this.hasNext = true;
			} else if (resp.data.transactions.length > this.limit) {
				this.hasNextNext = false;
				this.hasNext = true;
			} else {
				this.hasNextNext = false;
				this.hasNext = false;
			}
			// this.pages = this.makePages();
		} else {
			this.results = [];
		}
		this.loading = false;
	});
};

Pagination.prototype.loadData = Pagination.prototype.getData;

Pagination.prototype.makePages = function () {
	let arr;
	const n = Number(this.page);
	const numberOfPages = Math.ceil(this.pagination.count / this.limit);
	if (this.page > 2 && numberOfPages >= 4) {
		arr = [n - 1, n, n + 1, n + 2, numberOfPages];
	} else if (this.page + 1 === numberOfPages) {
		arr = [n - 3, n - 2, n - 1, n, n + 1, numberOfPages];
	} else if (this.page === numberOfPages) {
		arr = [n - 4, n - 3, n - 2, n - 1, n];
	} else {
		arr = [1, 2, 3, 4, numberOfPages];
	}
	return arr.filter(el => el > 0);
};

Pagination.prototype.disable = function () {
	this.hasNext = false;
	this.hasPrev = false;
};

Pagination.prototype.disabled = function () {
	return !this.hasNext && !this.hasPrev;
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


Pagination.prototype.loadNext = function () {
	this.nextOffset();
	this.loadData();
};

Pagination.prototype.loadPrev = function () {
	this.prevOffset();
	this.loadData();
};

Pagination.prototype.loadPageOffset = function (offset) {
	if (offset > 0) this.nextOffset(offset);
	if (offset < 0) this.prevOffset(-offset);
	this.loadData();
};

Pagination.prototype.nextOffset = function (offset) {
	this.currentPage += offset || 1;
	return this.offset += this.limit;
};

Pagination.prototype.prevOffset = function (offset) {
	this.currentPage -= offset || 1;
	return this.offset -= this.limit;
};

AppServices.factory('pagination',
	($http, $q) => params => new Pagination($http, $q, params));

export default Pagination;
