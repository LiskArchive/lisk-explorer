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
import AppServices from './services.module';
import Pagination from './pagination';

AppServices.factory('genericTxs',
	($http, $q) => (data) => {
		const params = Object.assign({}, data, {
			url: '/api/getTransactions',
			key: 'transactions',
		});

		return new Pagination($http, $q, params);
	});
