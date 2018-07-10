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
import AppBlocks from './blocks.module';
import template from './block.html';

const BlockConstructor = function ($rootScope, $stateParams, $location, $http, blockTxs) {
	const vm = this;
	vm.getLastBlocks = (n) => {
		let offset = 0;

		if (n) {
			offset = (n - 1) * 20;
		}

		$http.get(`${$rootScope.apiBaseUrl}/getLastBlocks?n=${offset}`).then((resp) => {
			if (resp.data.success) {
				vm.blocks = resp.data.blocks;

				if (resp.data.pagination) {
					vm.pagination = resp.data.pagination;
				}
			} else {
				vm.blocks = [];
			}
		});
	};

	vm.getBlock = (blockId) => {
		$http.get(`${$rootScope.apiBaseUrl}/getBlock`, {
			params: {
				blockId,
			},
		}).then((resp) => {
			if (resp.data.success) {
				vm.block = resp.data.block;
			} else {
				throw new Error('Block was not found!');
			}
		}).catch(() => {
			$location.path('/');
		});
	};

	if ($stateParams.blockId) {
		vm.block = {
			id: $stateParams.blockId,
		};
		vm.getBlock($stateParams.blockId);
		vm.txs = blockTxs($stateParams.blockId);
	} else if ($stateParams.page) {
		vm.getLastBlocks($stateParams.page);
	} else {
		vm.getLastBlocks();
	}
};

AppBlocks.component('block', {
	template,
	controller: BlockConstructor,
	controllerAs: 'vm',
});
