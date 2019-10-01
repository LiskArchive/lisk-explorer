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

const TransactionsConstructor = function ($rootScope, $scope, $stateParams, $element, $state) {
	$scope.currentPage = $state.current.component;
	$scope.searchModel = [];
	$scope.searchParams = [];
	$scope.availableSearchParams = [
		{ key: 'address', name: 'Address', placeholder: 'Address...', example: '12317412804123L', visible: ['transactions'] },
		{ key: 'senderId', name: 'Sender ID', placeholder: 'Sender...', example: '12317412804123L', visible: ['transactions', 'address'] },
		{ key: 'senderPublicKey', name: 'Sender Public Key', placeholder: 'Sender Public Key...', example: 'b550ede5...a26c78d8', visible: ['transactions', 'address'] },
		{ key: 'recipientId', name: 'Recipient ID', placeholder: 'Recipient...', example: '12317412804123L', visible: ['transactions', 'address'] },
		{ key: 'recipientPublicKey', name: 'Recipient Public Key', placeholder: 'Recipient Public Key...', example: 'b550ede5...a26c78d8', visible: ['transactions', 'address'] },
		{ key: 'minAmount', name: 'Min Amount', placeholder: 'Min Amount...', example: '1.25', visible: ['transactions', 'address'] },
		{ key: 'maxAmount', name: 'Max Amount', placeholder: 'Max Amount...', example: '1000.5', visible: ['transactions', 'address'] },
		{ key: 'type', name: 'Transaction type', placeholder: 'Type...', example: '1', visible: ['transactions', 'address'] },
		{ key: 'height', name: 'Block height', placeholder: 'Block Height...', example: '2963014', visible: ['transactions', 'address'] },
		{ key: 'blockId', name: 'Block Id', placeholder: 'Block Id...', example: '17238091754034756025', visible: ['transactions', 'address'] },

		// { key: 'fromTimestamp', name: 'From', placeholder: 'From...', example: '' },
		// { key: 'toTimestamp', name: 'To', placeholder: 'To...', example: '' },
		// { key: 'limit', name: 'Limit', placeholder: 'Limit...', example: '12317412804123L' },
		// { key: 'offset', name: 'Offset', placeholder: 'Offset...', example: '12317412804123L' },
		// {
		// 	key: 'sort',
		// 	name: 'Order By',
		// 	placeholder: 'Order By...',
		// 	restrictToSuggestedValues: true,
		// 	suggestedValues:
		//     ['amount:asc', 'amount:desc', 'fee:asc', 'fee:desc', 'type:asc',
		//      'type:desc', 'timestamp:asc', 'timestamp:desc'],
		// },
	];

	const convertToUrl = (key, param) => {
		switch (key) {
		case 'minAmount':
		case 'maxAmount':
			return Number(param) * Math.pow(10, 8);
		default:
			return param;
		}
	};

	const convertFromUrl = (key, param) => {
		switch (key) {
		case 'minAmount':
		case 'maxAmount':
			return Number(param) / Math.pow(10, 8);
		default:
			return encodeURI(param);
		}
	};

	$scope.addToQueryText = (key) => {
		$scope.queryText += ` ${key}=`;
	};

	$scope.performSearch = () => {
		let query;
		if ($scope.currentPage === 'address') {
			if ($stateParams.senderId !== $stateParams.address) {
				$stateParams.senderId = undefined;
			}
			if ($stateParams.recipientId !== $stateParams.address) {
				$stateParams.recipientId = undefined;
			}
			query = $scope.queryText.split(' ')
				.map(param => param.split('='))
				.concat([['address', $stateParams.address]])
				.reduce((acc, param) => {
					acc[param[0]] = convertToUrl(param[0], param[1]);
					return acc;
				}, {});
		} else {
			query = $scope.queryText.split(' ')
				.map(param => param.split('='))
				.reduce((acc, param) => {
					acc[param[0]] = convertToUrl(param[0], param[1]);
					return acc;
				}, {});
		}

		const obj = { address: $stateParams.address, page: 1 };
		$state.go($state.current.component, Object.assign(obj, query), { inherit: false });
	};

	if ($scope.currentPage === 'address') {
		$scope.currentAddress = $stateParams.address;
		$scope.queryText = Object.keys($stateParams)
			.filter(key => key !== 'page')
			.filter(key => key !== 'address')
			.filter(key => key !== 'sort')
			.filter(key => key !== '#')
			.filter(key => typeof $stateParams[key] !== 'undefined')
			.map(key => `${key}=${convertFromUrl(key, $stateParams[key])}`)
			.join(' ');
	} else {
		$scope.queryText = Object.keys($stateParams)
			.filter(key => key !== 'page')
			.filter(key => key !== 'sort')
			.filter(key => key !== '#')
			.filter(key => typeof $stateParams[key] !== 'undefined')
			.map(key => `${key}=${convertFromUrl(key, $stateParams[key])}`)
			.join(' ');
	}

	$scope.parametersDisplayLimit = $scope.availableSearchParams.length;
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
