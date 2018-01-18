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
const orders = require('../orders');
const config = require('../../config');
const _ = require('underscore');

module.exports = function (app) {
	const exchanges = {
		poloniex: new orders.poloniex(app.locals.redis),
		bittrex: new orders.bittrex(app.locals.redis),
	};

	/* Revisit this later to add more exchanges */
	const validExchange = (e) => {
		if (!_.has(config.marketWatcher.exchanges, e) ||
			!config.marketWatcher.exchanges[e] ||
			!exchanges[e]) {
			return null;
		}
		return exchanges[e];
	};

	this.getOrders = (e, error, success) => {
		if (!config.marketWatcher.enabled) {
			return error({ success: false, error: 'Orders data not enabled' });
		}

		if (validExchange(e) === null) {
			return error({ success: false, error: 'Invalid Exchange' });
		}

		return validExchange(e).restoreOrders((err, reply) => {
			if (err) {
				return error({ success: false, error: 'Error retrieving orders data' });
			}
			return success({ success: true, orders: reply });
		});
	};
};
