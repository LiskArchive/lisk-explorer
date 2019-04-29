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
import AppDelegate from './delegate.module';
import template from './delegate.html';

const DelegateConstructor = function ($rootScope, $stateParams,
	$location, $http, addressTxs, $state) {
	const vm = this;

	$rootScope.breadCrumb = { address: $stateParams.delegateId };

	vm.getAddress = () => {
		$http.get(`${$rootScope.apiBaseUrl}/getAccount`, {
			params: {
				address: $stateParams.delegateId,
			},
		}).then((resp) => {
			if (resp.data.success) {
				vm.address = resp.data;
				vm.getVotes(vm.address.publicKey);

				if (vm.address.delegate) {
					vm.getVoters(vm.address.publicKey);
				} else {
					$state.go('address', { address: $stateParams.delegateId });
				}
			} else {
				$state.go('home');
			}
		}).catch(() => {
			$location.path('/');
		});
	};

	vm.getVotes = (publicKey) => {
		$http.get('/api/getVotes', { params: { publicKey } }).then((resp) => {
			if (resp.data.success) {
				vm.address.votes = resp.data.votes;
			}
		});
	};

	vm.getVoters = (publicKey) => {
		$http.get('/api/getVoters', { params: { publicKey } }).then((resp) => {
			if (resp.data.success) {
				vm.address.voters = resp.data.voters;
				vm.address.votersMeta = resp.data.meta;
				vm.address.votersCount = vm.address.votersMeta.count;
			}
		});
	};

	vm.loadMoreVoters = () => {
		const limit = vm.address.votersMeta.limit;
		const offset = vm.address.votersMeta.offset + limit;

		$http.get('/api/getVoters', { params: { publicKey: vm.address.publicKey, limit, offset } }).then((resp) => {
			if (resp.data.success) {
				for (let i = 0; i < resp.data.voters.length; i++) {
					if (vm.address.voters.indexOf(resp.data.voters[i]) < 0) {
						vm.address.voters.push(resp.data.voters[i]);
					}
				}

				vm.address.votersMeta = resp.data.meta;
				vm.address.votersCount = vm.address.votersMeta.count;
			}
		});
	};

	vm.address = {
		address: $stateParams.delegateId,
	};

	// Sets the filter for which transactions to display
	vm.filterTxs = (direction) => {
		vm.direction = direction;
		vm.txs = addressTxs({ address: $stateParams.delegateId, direction });
	};

	vm.getAddress();
	vm.txs = addressTxs({ address: $stateParams.delegateId });
};

AppDelegate.component('delegate', {
	template,
	controller: DelegateConstructor,
	controllerAs: 'vm',
});
