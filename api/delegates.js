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
		path: 'delegates/getActive',
		service: 'delegates',
		params: () => undefined,
	}, {
		path: 'delegates/getStandby',
		service: 'delegates',
		params: req => req.query.n,
	}, {
		path: 'delegates/getLatestRegistrations',
		service: 'delegates',
		params: () => undefined,
	}, {
		path: 'delegates/getLatestVotes',
		service: 'delegates',
		params: () => undefined,
	}, {
		path: 'getSearch',
		service: 'delegates',
		params: req => req.query.q,
	}, {
		path: 'delegates/getLastBlock',
		service: 'delegates',
		params: () => undefined,
	}, {
		path: 'delegates/getLastBlocks',
		service: 'delegates',
		params: req => ({
			publicKey: req.query.publicKey,
			limit: req.query.limit,
		}),
	}, {
		path: 'delegates/getNextForgers',
		service: 'delegates',
		params: () => undefined,
	},
];
