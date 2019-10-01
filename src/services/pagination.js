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

Pagination.prototype.getData = function () {
	this.loading = true;

	const transfomedFilters = this.transformAccountFilters(this.params.filters);

	const filters = transfomedFilters.reduce((obj, item) => {
		obj[item.key] = item.value;
		return obj;
	}, {});

	const requestLimit = (this.limit * 2) + 1;
	const offset = (this.page - 1) * this.limit;

	const requestParams = Object.assign({ limit: requestLimit, offset }, filters);

	return this.$http.get(this.url, { params: requestParams }).then((resp) => {
		if (resp.data.success) {
			this.data = resp.data.transactions;
			this.pagination = resp.data.pagination;

			this.simplePagination(offset, resp.data.transactions);

			try {
				if (this.pagination) this.realPagination();
				else this.predictivePagination();
			} catch (e) {
				// Problem with pagination, keeps prev/next only
			}

			this.results = resp.data.transactions.slice(0, this.limit);
		} else {
			this.results = [];
		}
		this.loading = false;
	});
};

Pagination.prototype.transformAccountFilters = (filters) => {
	const filterList = filters.map(p => p.key);
	if (filterList.includes('senderId') || filterList.includes('recipientId')
		|| filterList.includes('senderPublicKey') || filterList.includes('recipientPublicKey')) {
		return filters.filter(p => p.key !== 'address');
	}
	return filters;
};

Pagination.prototype.loadData = Pagination.prototype.getData;

Pagination.prototype.simplePagination = function () {
	const data = this.data;
	this.hasPrev = !!(this.page - 1);
	if (data.length > this.limit) this.hasNext = true;
	else this.hasNext = false;
};

Pagination.prototype.realPagination = function () {
	let arr = [];
	const n = Number(this.page);
	const numberOfPages = Math.ceil(this.pagination.count / this.limit);

	if (this.page === numberOfPages) {
		arr = [n - 4, n - 3, n - 2, n - 1, n];
	} else if (this.page + 1 === numberOfPages) {
		arr = [n - 3, n - 2, n - 1, n, n + 1];
	} else if (numberOfPages >= 5 && this.page === 1) {
		arr = [n, n + 1, n + 2, n + 3, n + 4];
	} else if (numberOfPages >= 5 && this.page === 2) {
		arr = [n - 1, n, n + 1, n + 2, n + 3];
	} else if (numberOfPages >= 5 && this.page > 2) {
		arr = [n - 2, n - 1, n, n + 1, n + 2];
	} else if (numberOfPages <= 5) {
		arr = Array.from(Array(numberOfPages).keys());
	}
	this.pages = arr.filter(el => el > 0);
};

Pagination.prototype.predictivePagination = function () {
	const data = this.data;
	const page = this.page;

	this.numberOfPages = Math.ceil(data.count / this.limit);
	if (data.length > (this.limit * 2)) {
		this.hasNextNext = true;
	} else {
		this.hasNextNext = false;
	}

	let arr;
	const n = Number(page);

	if (this.hasNextNext) {
		arr = [n - 2, n - 1, n, n + 1, n + 2];
	} else if (this.hasNext) {
		arr = [n - 3, n - 2, n - 1, n, n + 1];
	} else {
		arr = [n - 4, n - 3, n - 2, n - 1, n];
	}

	this.pages = arr.filter(el => el > 0);
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
