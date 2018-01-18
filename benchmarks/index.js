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
const accounts = require('./accounts.js');
const blocks = require('./blocks.js');
const common = require('./common.js');
const delegates = require('./delegates.js');
// const exchanges = require('./exchanges.js');
const statistics = require('./statistics.js');
const transactions = require('./transactions.js');
const handler = require('./handler');

const routes = [].concat(transactions, accounts, blocks, common,
	delegates, statistics);

const apis = {};

module.exports = function (app, api) {
	routes.forEach((route) => {
		if (!apis[route.service]) {
			apis[route.service] = new api[route.service](app);
		}

		if (!this[route.service]) {
			this[route.service] = {};
		}

		this[route.service][route.endpoint] = deferred =>
			handler(apis[route.service], route.endpoint, route.params,
				deferred, (route.title || route.service), route.data);
	});
};
