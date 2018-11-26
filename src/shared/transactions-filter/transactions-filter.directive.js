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
import AppTools from '../../app/app-tools.module';
import template from './transactions-filter.html';

const TransactionsConstructor = function ($rootScope, $scope, $timeout, allTxs) {
	$scope.searchModel = [];
	$scope.searchParams = [];
	$scope.availableSearchParams = [
		{ key: 'senderId', name: 'Sender ID', placeholder: 'Sender...' },
		{ key: 'senderPublicKey', name: 'Sender Public Key', placeholder: 'Sender Public Key...' },
		{ key: 'recipientId', name: 'Recipient ID', placeholder: 'Recipient...' },
		{ key: 'recipientPublicKey', name: 'Recipient Public Key', placeholder: 'Recipient Public Key...' },
		{ key: 'minAmount', name: 'Min Amount', placeholder: 'Min Amount...' },
		{ key: 'maxAmount', name: 'Max Amount', placeholder: 'Max Amount...' },
		{ key: 'type', name: 'Transaction Type', placeholder: 'Comma separated...' },
		{ key: 'height', name: 'Block Height', placeholder: 'Block Height...' },
		{ key: 'blockId', name: 'Block Id', placeholder: 'Block Id...' },
		{ key: 'fromTimestamp', name: 'From Timestamp', placeholder: 'From Timestamp...' },
		{ key: 'toTimestamp', name: 'To Timestamp', placeholder: 'To Timestamp...' },
		{ key: 'limit', name: 'Limit', placeholder: 'Limit...' },
		{ key: 'offset', name: 'Offset', placeholder: 'Offset...' },
		{
			key: 'sort',
			name: 'Order By',
			placeholder: 'Order By...',
			restrictToSuggestedValues: true,
			suggestedValues: ['amount:asc', 'amount:desc', 'fee:asc', 'fee:desc', 'type:asc', 'type:desc', 'timestamp:asc', 'timestamp:desc'],
		},
	];

	$scope.parametersDisplayLimit = $scope.availableSearchParams.length;

	const onSearchBoxCleaned = () => {
		if ($scope.cleanByFilters) {
			$scope.cleanByFilters = false;
		} else {
			$scope.invalidParams = false;
			$scope.txs = allTxs();
			$scope.txs.loadData();
		}
	};

	const searchByParams = (params) => {
		if ($scope.direction !== 'search') {
			$scope.lastDirection = $scope.direction;
			$scope.direction = 'search';
		}
		$scope.invalidParams = false;
		$scope.txs = allTxs(params);
		$scope.txs.loadData();
	};

	const onSearchChange = () => {
		const params = {};
		Object.keys($scope.searchModel).forEach((key) => {
			if ($scope.searchModel[key] !== undefined && $scope.searchModel[key] !== '') {
				params[key] = $scope.searchModel[key];
			}
			if ((key === 'minAmount' || key === 'maxAmount') && params[key] !== '') {
				params[key] = Math.floor(parseFloat(params[key]) * 1e8);
			}
		});

		if (params.query) {
			params.senderId = params.query;
			params.recipientId = params.query;
		}

		if (Object.keys(params).length > 0) {
			searchByParams(params);
		} else {
			onSearchBoxCleaned();
		}
	};

	$rootScope.$on('advanced-searchbox:modelUpdated', (event, model) => {
		if ($scope.searchModel.query !== model.query) {
			$scope.searchModel = Object.assign({}, model);
			return onSearchChange();
		}

		return $scope.searchModel = Object.assign({}, model);
	});

	$rootScope.$on('advanced-searchbox:removedSearchParam', (event, searchParameter) => {
		delete $scope.searchModel[searchParameter.key];
		onSearchChange();
	});

	$rootScope.$on('advanced-searchbox:removedAllSearchParam', () => {
		onSearchBoxCleaned();
	});

	$rootScope.$on('advanced-searchbox:leavedEditMode', (event, searchParameter) => {
		$scope.searchModel[searchParameter.key] = searchParameter.value;
		onSearchChange();
	});

	// Sets autocomplete attr off
	const disableAutocomplete = () => {
		$timeout(() => {
			document.getElementsByClassName('search-parameter-input')[0].setAttribute('autocomplete', 'off');
		}, 0);
	};

	disableAutocomplete();
};

const transactionsFilter = AppTools.directive('transactionsFilter', () => ({
	template,
	controller: TransactionsConstructor,
	scope: {
		txs: '=',
		address: '=',
	},
}));

export default transactionsFilter;
