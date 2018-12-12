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
import AppTransactions from './transactions.module';
import template from './transactions.html';

const TransactionsConstructor = function ($rootScope, $stateParams, $state, $http, $interval) {
	const vm = this;

	const filters = Object.keys($stateParams)
		.filter(key => key !== 'page')
		.filter(key => key !== '#')
		.filter(key => typeof $stateParams[key] !== 'undefined')
		.map(key => `${key}=${$stateParams[key]}`);

	vm.getLastTransactions = (n) => {
		const limit = 20 + 1;
		let offset = 0;
		if (n) offset = (n - 1) * limit;

		let requestUrl = `/api/getTransactions?limit=${limit}&offset=${offset}`;
		requestUrl += filters.length ? `&${filters.join('&')}` : '';

		$http.get(requestUrl).then((resp) => {
			if (resp.data.success) {
				let removedTx;
				if (resp.data.transactions.length > limit - 1) {
					removedTx = resp.data.transactions.splice(-1, 1);
				}

				vm.txs = { results: resp.data.transactions };
				vm.txs.hasPrev = !!offset;
				vm.txs.hasNext = !!removedTx;
				vm.txs.page = $stateParams.page || 1;
				vm.txs.loadPageOffset = vm.loadPageOffset;
				vm.txs.loadPage = vm.loadPage;
				vm.txs.activeSort = vm.activeSort;
				vm.txs.applySort = vm.applySort;
			} else {
				vm.txs = {};
			}
		});
	};

	vm.loadPageOffset = (offset) => {
		$state.go($state.current.component, { page: Number(vm.txs.page || 1) + offset });
	};

	vm.loadPage = (pageNumber) => {
		$state.go($state.current.component, { page: pageNumber });
	};

	vm.applySort = (predicate) => {
		const direction = (predicate === vm.activeSort.predicate && vm.activeSort.direction === 'asc') ? 'desc' : 'asc';
		$state.go($state.current.component, { sort: `${predicate}:${direction}` });
	};

	vm.activeSort = typeof $stateParams.sort === 'string'
		? { predicate: $stateParams.sort.split(':')[0], direction: $stateParams.sort.split(':')[1] }
		: { predicate: 'timestamp', direction: 'desc' };

	const update = () => {
		vm.getLastTransactions($stateParams.page || 1);
	};

	update();

	vm.transactionsInterval = $interval(() => {
		update();
	}, 30000);
};

AppTransactions.component('transactions', {
	template,
	controller: TransactionsConstructor,
	controllerAs: 'vm',
});
