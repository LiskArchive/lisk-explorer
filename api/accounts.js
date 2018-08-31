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
		path: 'getAccount',
		service: 'accounts',
		params: req => req.query,
	}, {
		path: 'getTopAccounts',
		service: 'accounts',
		params: req => ({
			offset: req.query.offset,
			limit: req.query.limit,
		}),
	},
	{
		path: 'getVotes',
		service: 'accounts',
		params: req => ({
			publicKey: req.query.publicKey,
			offset: req.query.offset,
			limit: req.query.limit,
		}),
	},
	{
		path: 'getVoters',
		service: 'accounts',
		params: req => ({
			publicKey: req.query.publicKey,
			offset: req.query.offset,
			limit: req.query.limit,
		}),
	},
];
