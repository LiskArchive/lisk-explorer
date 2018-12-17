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
	vm.getLastTransactions = (n) => {
		const limit = 40 + 1;
		const pageLength = 20;
		let offset = 0;
		if (n) offset = (n - 1) * limit;

		$http.get(`/api/getTransactions?limit=${limit}&offset=${offset}`).then((resp) => {
			if (resp.data.success) {
				vm.txs = { results: resp.data.transactions.slice(0, 19) };
				vm.txs.hasPrev = !!offset;

				if (resp.data.transactions.length > pageLength * 2) {
					vm.txs.hasNextNext = true;
					vm.txs.hasNext = true;
				} else if (resp.data.transactions.length > pageLength) {
					vm.txs.hasNextNext = false;
					vm.txs.hasNext = true;
				} else {
					vm.txs.hasNextNext = false;
					vm.txs.hasNext = false;
				}
				vm.txs.page = $stateParams.page || 0;
				vm.txs.pages = vm.makePages(vm.txs.page, vm.txs);
				vm.txs.loadPageOffset = vm.loadPageOffset;
				vm.txs.loadPage = vm.loadPage;
			} else {
				vm.txs = {};
			}
		});
	};

	vm.makePages = (page, txs) => {
		let arr;
		const n = Number(page);
		if (page > 2 && txs.hasNextNext) {
			arr = [n - 2, n - 1, n, n + 1, n + 2];
		} else if (!txs.hasNextNext && txs.hasNext) {
			arr = [n - 3, n - 2, n - 1, n, n + 1];
		} else if (!txs.hasNextNext && !txs.hasNext) {
			arr = [n - 4, n - 3, n - 2, n - 1, n];
		} else {
			arr = [1, 2, 3, 4, 5];
		}
		return arr;
	};

	vm.loadPageOffset = (offset) => {
		$state.go($state.current.component, { page: Number(vm.txs.page || 1) + offset });
	};

	vm.loadPage = (pageNumber) => {
		$state.go($state.current.component, { page: pageNumber });
	};

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
