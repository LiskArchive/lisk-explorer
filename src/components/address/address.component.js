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

const AddressConstructor = function ($rootScope, $stateParams, $location, $http, addressTxs) {
	const vm = this;
	vm.searchModel = [];

	vm.getAddress = () => {
		$http.get('/api/getAccount', {
			params: {
				address: $stateParams.address,
			},
		}).then((resp) => {
			if (resp.data.success) {
				vm.address = resp.data;
			} else {
				throw new Error('Account was not found!');
			}
		}).catch(() => {
			$location.path('/');
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

	vm.searchParams = [];
	vm.availableSearchParams = [
		{ key: 'senderId', name: 'Sender', placeholder: 'Sender...' },
		{ key: 'recipientId', name: 'Recipient', placeholder: 'Recipient...' },
		{ key: 'minAmount', name: 'Min', placeholder: 'Min Amount...' },
		{ key: 'maxAmount', name: 'Max', placeholder: 'Max Amount...' },
		{ key: 'type', name: 'Type', placeholder: 'Comma separated...' },
		{ key: 'senderPublicKey', name: 'SenderPk', placeholder: 'Sender Public Key...' },
		{ key: 'recipientPublicKey', name: 'RecipientPk', placeholder: 'Recipient Public Key...' },
		{ key: 'height', name: 'Block Height', placeholder: 'Block Id...' },
		{ key: 'blockId', name: 'Block Id', placeholder: 'Block Id...' },
		{ key: 'fromTimestamp', name: 'fromTimestamp', placeholder: 'From Timestamp...' },
		{ key: 'toTimestamp', name: 'toTimestamp', placeholder: 'To Timestamp...' },
		{ key: 'limit', name: 'limit', placeholder: 'Limit...' },
		{ key: 'offset', name: 'offset', placeholder: 'Offset...' },
		{
			key: 'sort',
			name: 'orderBy',
			placeholder: 'Order By...',
			restrictToSuggestedValues: true,
			suggestedValues: ['amount:asc', 'amount:desc', 'fee:asc', 'fee:desc', 'type:asc', 'type:desc', 'timestamp:asc', 'timestamp:desc'],
		},
	];
	vm.parametersDisplayLimit = vm.availableSearchParams.length;

	vm.onFiltersUsed = () => {
		vm.cleanByFilters = true;
		const { removeAll } = angular.element(document.getElementsByClassName('search-parameter-input')[0]).scope();
		if (removeAll) {
			removeAll();
		}
	};

	const onSearchBoxCleaned = () => {
		if (vm.cleanByFilters) {
			vm.cleanByFilters = false;
		} else {
			vm.invalidParams = false;
			vm.filterTxs(vm.lastDirection);
			vm.txs.loadData();
		}
	};

	const searchByParams = (params) => {
		if (vm.direction !== 'search') {
			vm.lastDirection = vm.direction;
			vm.direction = 'search';
		}
		vm.invalidParams = false;
		vm.txs = addressTxs(params);
		vm.txs.loadData();
	};

	const isValidAddress = id => /([0-9]+)L$/.test(id);

	const onSearchChange = () => {
		const params = {};
		Object.keys(vm.searchModel).forEach((key) => {
			if (vm.searchModel[key] !== undefined && vm.searchModel[key] !== '') {
				params[key] = vm.searchModel[key];
			}
			if ((key === 'minAmount' || key === 'maxAmount') && params[key] !== '') {
				params[key] = Math.floor(parseFloat(params[key]) * 1e8);
			}
		});

		if (params.query) {
			params.senderId = params.query;
			params.recipientId = params.query;
		} else {
			params.senderId = params.senderId || $stateParams.address;
			params.recipientId = params.recipientId || $stateParams.address;
		}

		if (Object.keys(params).length > 0 &&
			(isValidAddress(params.recipientId) ||
			isValidAddress(params.senderId))) {
			searchByParams(params);
		} else if (Object.keys(vm.searchModel).length === 0) {
			onSearchBoxCleaned();
		} else {
			vm.invalidParams = true;
		}
	};

	$rootScope.$on('advanced-searchbox:modelUpdated', (event, model) => {
		vm.searchModel = model;
	});

	$rootScope.$on('advanced-searchbox:removedSearchParam', (event, searchParameter) => {
		delete vm.searchModel[searchParameter.key];
		onSearchChange();
	});

	$rootScope.$on('advanced-searchbox:removedAllSearchParam', () => {
		onSearchBoxCleaned();
	});

	$rootScope.$on('advanced-searchbox:leavedEditMode', () => {
		onSearchChange();
	});

	vm.getAddress();
	vm.txs = addressTxs({ address: $stateParams.address });
};

AppAddress.component('address', {
	template,
	controller: AddressConstructor,
	controllerAs: 'vm',
});
