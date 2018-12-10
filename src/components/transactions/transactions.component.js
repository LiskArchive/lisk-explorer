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

const TransactionsConstructor = function ($rootScope, $stateParams, $location, $http, $interval) {
	const vm = this;
	vm.getLastTransactions = (n) => {
		const limit = 20 + 1;
		let offset = 0;

		if (n) {
			offset = (n - 1) * limit;
		}

		$http.get(`/api/getTransactions?limit=${limit}&offset=${offset}`).then((resp) => {
			if (resp.data.success) {
				const removedTx = resp.data.transactions.splice(-1, 1);

				vm.txs = { results: resp.data.transactions };
				vm.txs.hasPrev = !!offset;
				vm.txs.hasNext = !!removedTx;
			} else {
				vm.txs = {};
			}
		});
	};

	const update = () => {
		if ($stateParams.page) {
			vm.getLastTransactions($stateParams.page);
		} else {
			vm.getLastTransactions();
		}
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
