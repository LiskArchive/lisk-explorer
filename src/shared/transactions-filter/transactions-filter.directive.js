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
	$scope.searchModel = [];
	$scope.searchParams = [];
	$scope.availableSearchParams = [
		{ key: 'senderId', name: 'Sender ID', placeholder: 'Sender...', example: '12317412804123L' },
		{ key: 'senderPublicKey', name: 'Sender Public Key', placeholder: 'Sender Public Key...', example: 'b550ede5...a26c78d8' },
		{ key: 'recipientId', name: 'Recipient ID', placeholder: 'Recipient...', example: '12317412804123L' },
		{ key: 'recipientPublicKey', name: 'Recipient Public Key', placeholder: 'Recipient Public Key...', example: 'b550ede5...a26c78d8' },
		{ key: 'minAmount', name: 'Min Amount', placeholder: 'Min Amount...', example: '1.25' },
		{ key: 'maxAmount', name: 'Max Amount', placeholder: 'Max Amount...', example: '1000.5' },
		{ key: 'type', name: 'Comma separated transaction types', placeholder: 'Comma separated...', example: '1,3' },
		{ key: 'height', name: 'Block height', placeholder: 'Block Height...', example: '2963014' },
		{ key: 'blockId', name: 'Block Id', placeholder: 'Block Id...', example: '17238091754034756025' },
		{ key: 'fromTimestamp', name: 'From Timestamp', placeholder: 'From Timestamp...', example: '17238091754034756025' },
		{ key: 'toTimestamp', name: 'To Timestamp', placeholder: 'To Timestamp...', example: '12317412804123L' },
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
		const query = $scope.queryText.split(' ')
			.map(param => param.split('='))
			.reduce((acc, param) => {
				acc[param[0]] = convertToUrl(param[0], param[1]);
				return acc;
			}, {});
		$state.go($state.current.component, Object.assign({ page: 1 }, query), { inherit: false });
	};

	$scope.queryText = Object.keys($stateParams)
		.filter(key => key !== 'page')
		.filter(key => key !== 'address')
		.filter(key => key !== 'sort')
		.filter(key => key !== '#')
		.filter(key => typeof $stateParams[key] !== 'undefined')
		.map(key => `${key}=${convertFromUrl(key, $stateParams[key])}`)
		.join(' ');

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
