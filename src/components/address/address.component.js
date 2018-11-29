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
import angular from 'angular';
import AppAddress from './address.module';
import template from './address.html';

const AddressConstructor = function (
	$stateParams,
	$location,
	$http,
	addressTxs,
) {
	const vm = this;

	const addAccountTypeDescription = (d) => {
		if (vm.address.isMultisig && vm.address.isDelegate) {
			d.accountType = 'Multisignature delegate account';
		} else if (vm.address.isMultisig) {
			d.accountType = 'Multisignature account';
		} else if (vm.address.isDelegate) {
			d.accountType = 'Delegate account';
		} else {
			d.accountType = 'Regular account';
		}

		if (d.secondSignature) {
			d.accountType += ' with a second signature';
		}
		if (Array.isArray(d.multisignatureMemberships) && d.multisignatureMemberships.length >= 1) {
			d.accountType += `, member of ${d.multisignatureMemberships.length} multisignature group`;
		}
		if (Array.isArray(d.multisignatureMemberships) && d.multisignatureMemberships.length > 1) {
			d.accountType += 's';
		}
		return d;
	};

	vm.getAddress = () => {
		$http.get('/api/getAccount', {
			params: {
				address: $stateParams.address,
			},
		}).then((resp) => {
			if (resp.data.success) {
				vm.address.isMultisig = resp.data.multisignatureAccount !== null && typeof resp.data.multisignatureAccount === 'object' && resp.data.multisignatureAccount.members;
				vm.address.isDelegate = resp.data.delegate !== null && typeof resp.data.delegate === 'object' && resp.data.delegate.username;
				vm.address = addAccountTypeDescription(resp.data);
				vm.getVotes(vm.address.publicKey);
				if (vm.isDelegate) { vm.getVoters(vm.address.publicKey); }
			} else {
				throw new Error('Account was not found!');
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
		address: $stateParams.address,
	};

	// Sets the filter for which transactions to display
	vm.filterTxs = (direction) => {
		vm.direction = direction;
		vm.txs = addressTxs({ address: $stateParams.address, direction });
	};

	vm.onFiltersUsed = () => {
		vm.cleanByFilters = true;
		const { removeAll } = angular.element(document.getElementsByClassName('search-parameter-input')[0]).scope();
		if (removeAll) {
			removeAll();
		}
	};

	vm.getAddress();

	vm.txs = addressTxs({ address: $stateParams.address });
};

AppAddress.component('address', {
	template,
	controller: AddressConstructor,
	controllerAs: 'vm',
});
