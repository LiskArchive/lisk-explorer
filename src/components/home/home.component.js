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

const HomeConstructor = function ($scope, $http, $interval) {
	const vm = this;

	const setHref = (tx) => {
		tx.hrefSender = `/address/${tx.senderId}`;
		tx.hrefRecipient = `/address/${tx.recipientId}`;
	};

	// Blocks
	vm.getLastBlocks = () => {
		$http.get('/api/getLastBlocks').then((resp) => {
			if (resp.data.success && Array.isArray(resp.data.blocks)) {
				resp.data.blocks.sort((a, b) => b.height > a.height);
				vm.lastBlock = resp.data.blocks.slice(0, 1)[0];
				vm.latestBlocks = resp.data.blocks.slice(1, 5);
			}
		});
	};
	vm.blocksInterval = $interval(() => {
		vm.getLastBlocks();
	}, 10000);
	vm.getLastBlocks();

	// Transactions
	vm.getLastTransactions = () => {
		$http.get('/api/getLastTransactions').then((resp) => {
			if (resp.data.success) {
				vm.txs = resp.data.transactions.splice(0, 10);
				vm.txs.map(setHref);
			}
		});
	};
	vm.transactionsInterval = $interval(() => {
		vm.getLastTransactions();
	}, 30000);
	vm.getLastTransactions();

	// Peers
	vm.getPeers = () => {
		$http.get('/api/statistics/getPeers').then((resp) => {
			if (resp.data.success) {
				vm.peers = resp.data.list;
			}
		});
	};
	vm.getPeersInterval = $interval(() => {
		vm.getLastTransactions();
	}, 30000);
	vm.getPeers();

	// Delegates
	vm.getDelegates = () => {
		$http.get('/api/delegates/getActive').then((resp) => {
			if (resp.data.success) {
				vm.activeDelegates = resp.data.delegates;
				vm.delegatesCount = resp.data.totalCount;
			}
		});
	};
	vm.getDelegatesInterval = $interval(() => {
		vm.getLastTransactions();
	}, 30000);
	vm.getDelegates();
};

AppHome.component('home', {
	template,
	controller: HomeConstructor,
	controllerAs: 'vm',
});
