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
import AppHome from './home.module';
import template from './home.html';

const HomeConstructor = function ($rootScope, $http, $interval) {
	const vm = this;
	vm.getLastBlocks = () => {
		$http.get(`${$rootScope.apiBaseUrl}/getLastBlocks`).then((resp) => {
			if (resp.data.success) {
				if (vm.blocks && vm.blocks.length > 0) {
					if (vm.blocks[0].id !== resp.data.blocks[0].id) {
						vm.blocks = resp.data.blocks;
					}
				} else {
					vm.blocks = resp.data.blocks;
				}
			}
		});
	};

	vm.blocksInterval = $interval(() => {
		vm.getLastBlocks();
	}, 30000);

	vm.getLastBlocks();

	vm.getLastTransactions = () => {
		$http.get(`${$rootScope.apiBaseUrl}/getLastTransactions`).then((resp) => {
			if (resp.data.success) {
				if (vm.txs && vm.txs.length > 0) {
					if (vm.txs[0] !== resp.data.transactions[0]) {
						vm.txs = resp.data.transactions;
					}
				} else {
					vm.txs = resp.data.transactions;
				}
			}
		});
	};

	vm.transactionsInterval = $interval(() => {
		vm.getLastTransactions();
	}, 30000);

	vm.getLastTransactions();
};

AppHome.component('home', {
	template,
	controller: HomeConstructor,
	controllerAs: 'vm',
});
