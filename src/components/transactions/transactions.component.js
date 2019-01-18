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

const TransactionsConstructor = function ($rootScope, $stateParams, $state, $interval, genericTxs) {
	const vm = this;

	const filters = Object.keys($stateParams)
		.filter(key => key !== 'page')
		.filter(key => key !== '#')
		.filter(key => typeof $stateParams[key] !== 'undefined')
		// eslint-disable-next-line arrow-body-style
		.map((key) => { return { key, value: $stateParams[key] }; });

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

	vm.txs = genericTxs({
		page: $stateParams.page || 1,
		limit: 20,
		filters,
	});
	vm.txs.loadPageOffset = vm.loadPageOffset;
	vm.txs.activeSort = vm.activeSort;
	vm.txs.applySort = vm.applySort;
	vm.txs.loadPage = vm.loadPage;

	const update = () => vm.txs.loadData();

	vm.transactionsInterval = $interval(() => {
		update();
	}, 30000);

	update();
};

AppTransactions.component('transactions', {
	template,
	controller: TransactionsConstructor,
	controllerAs: 'vm',
});
