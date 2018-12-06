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
import leaflet from 'leaflet';
import 'leaflet.markercluster';

import AppHome from './home.module';
import template from './home.html';

const HomeConstructor = function ($scope, $http, $interval) {
	const vm = this;

	const setHref = (tx) => {
		tx.hrefSender = `/address/${tx.senderId}`;
		tx.hrefRecipient = `/address/${tx.recipientId}`;
	};

	vm.getLastBlocks = () => {
		$http.get('/api/getLastBlocks').then((resp) => {
			if (resp.data.success) {
				vm.blocks = resp.data.blocks.splice(0, 5);
			}
		});
	};

	vm.blocksInterval = $interval(() => {
		vm.getLastBlocks();
	}, 30000);

	vm.getLastBlocks();

	vm.getLastTransactions = () => {
		$http.get('/api/getLastTransactions').then((resp) => {
			if (resp.data.success) {
				vm.txs = resp.data.transactions.splice(0, 5);
				vm.txs.map(setHref);

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
