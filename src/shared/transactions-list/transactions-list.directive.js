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
import template from './transactions-list.html';

const transactionsList = AppTools.directive('transactionsList', orderBy => ({
	template,
	scope: {
		txs: '=',
		address: '=',
	},
	link: ($scope) => {
		$scope.filter = orderBy('date');
	},
}));

export default transactionsList;
