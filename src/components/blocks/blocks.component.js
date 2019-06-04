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
import template from './blocks.html';

const BlocksCtrlConstructor = function ($rootScope, $stateParams, $location, $http, genericTxs) {
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
					vm.pages = vm.makePages(vm.pagination.currentPage);
				}
			} else {
				vm.blocks = [];
			}
		});
	};

	vm.makePages = (page) => {
		let arr;
		const n = Number(page);
		if (n > 2) {
			arr = [n - 2, n - 1, n, n + 1, n + 2];
		} else {
			arr = [1, 2, 3, 4, 5];
		}
		return arr;
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
		vm.txs = genericTxs({ filters: [{ key: 'blockId', value: $stateParams.blockId }] });
	} else if ($stateParams.page) {
		vm.getLastBlocks($stateParams.page);
	} else {
		vm.getLastBlocks();
	}
};

AppBlocks.component('blocks', {
	template,
	controller: BlocksCtrlConstructor,
	controllerAs: 'vm',
});

