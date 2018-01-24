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
		endpoint: 'getActive',
		service: 'delegates',
		params: undefined,
		data: data => data.delegates.length,
	}, {
		endpoint: 'getStandby',
		service: 'delegates',
		params: 0,
		data: data => data.delegates.length,
	}, {
		endpoint: 'getLatestRegistrations',
		service: 'delegates',
		params: undefined,
		title: 'registrations',
		data: data => data.transactions.length,
	}, {
		endpoint: 'getLatestVotes',
		service: 'delegates',
		params: undefined,
		title: 'votes',
		data: data => data.transactions.length,
	}, {
		endpoint: 'getLastBlock',
		service: 'delegates',
		title: 'block',
		params: undefined,
	},
];
