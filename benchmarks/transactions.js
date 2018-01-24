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
module.exports = [
	{
		endpoint: 'getTransaction',
		service: 'transactions',
		title: 'transaction',
		params: '6538470051935780976',
	}, {
		endpoint: 'getUnconfirmedTransactions',
		service: 'transactions',
		params: undefined,
		data: data => data.transactions.length,
	}, {
		endpoint: 'getLastTransactions',
		service: 'transactions',
		params: undefined,
		data: data => data.transactions.length,
	}, {
		endpoint: 'getTransactionsByAddress',
		service: 'transactions',
		params: {
			address: '12907382053545086321C',
			offset: 0,
			limit: 100,
		},
		data: data => data.transactions.length,
	}, {
		endpoint: 'getTransactionsByBlock',
		service: 'transactions',
		params: {
			blockId: '13592630651917052637',
			offset: 0,
			limit: 100,
		},
		data: data => data.transactions.length,
	},
];
