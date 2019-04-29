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
import AppAddress from './address.module';
import template from './address.html';

const AddressConstructor = function (
	$state,
	$stateParams,
	$location,
	$http,
	$interval,
	genericTxs,
) {
	const vm = this;

	const defaultFilterPresets = {
		senderId: null,
		recipientId: null,
		type: null,
		page: 1,
	};

	const addAccountTypeDescription = (d) => {
		if (vm.isMultisig && vm.isDelegate) {
			vm.accountType = 'Multisignature delegate account';
		} else if (vm.isMultisig) {
			vm.accountType = 'Multisignature account';
		} else if (vm.isDelegate) {
			vm.accountType = 'Delegate account';
		} else {
			vm.accountType = 'Regular account';
		}

		if (d.secondSignature) {
			vm.accountType += ' with a second signature';
		}
		if (Array.isArray(d.multisignatureMemberships) && d.multisignatureMemberships.length >= 1) {
			vm.accountType += `, member of ${d.multisignatureMemberships.length} multisignature group`;
		}
		if (Array.isArray(d.multisignatureMemberships) && d.multisignatureMemberships.length > 1) {
			vm.accountType += 's';
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
				vm.isMultisig = resp.data.multisignatureAccount !== null && typeof resp.data.multisignatureAccount === 'object' && resp.data.multisignatureAccount.members;
				vm.isDelegate = resp.data.delegate !== null && typeof resp.data.delegate === 'object' && resp.data.delegate.username;
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

	const filters = Object.keys($stateParams)
		.filter(key => key !== 'page')
		.filter(key => key !== '#')
		.filter(key => typeof $stateParams[key] !== 'undefined')
		.map(key => ({ key, value: $stateParams[key] }));

	vm.loadPageOffset = (offset) => {
		$state.go($state.current.component, { page: Number(vm.txs.page || 1) + offset });
	};

	vm.loadPage = (pageNumber) => {
		$state.go($state.current.component, { page: pageNumber });
	};

	vm.loadPreset = (preset) => {
		const addressPresets = {
			sent: { senderId: vm.address.address, type: 0 },
			received: { recipientId: vm.address.address, type: 0 },
			typeZero: { type: 0 },
			multiSig: { type: 4 },
			voting: { type: 3 },
		};
		$state.go($state.current.component,
			Object.assign({}, defaultFilterPresets, addressPresets[preset]));
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

	const update = () => {
		vm.getAddress();
		vm.txs.loadData();
	};

	update();
};

AppAddress.component('address', {
	template,
	controller: AddressConstructor,
	controllerAs: 'vm',
});
