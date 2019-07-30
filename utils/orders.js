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
const orders = require('../lib/orders');
const async = require('async');
const logger = require('./logger');

module.exports = function (config, client) {
	const poloniex = new orders.poloniex(client);
	const bittrex = new orders.bittrex(client);
	let running = false;

	this.updateOrders = () => {
		if (running) {
			logger.debug('Orders:', 'Update already in progress');
			return;
		}
		running = true;


		async.series([
			(callback) => {
				if (!config.marketWatcher.exchanges.poloniex) {
					callback(null);
				} else {
					poloniex.updateOrders((err, res) => {
						if (err) {
							callback(err);
						} else {
							callback(null, res);
						}
					});
				}
			},
			(callback) => {
				if (!config.marketWatcher.exchanges.bittrex) {
					callback(null);
				} else {
					bittrex.updateOrders((err, res) => {
						if (err) {
							callback(err);
						} else {
							callback(null, res);
						}
					});
				}
			},
		],
		(err) => {
			if (err) {
				logger.error('Orders:', 'Error updating orders:', err);
			} else {
				logger.debug('Orders:', 'Updated successfully');
			}
			running = false;
		});
	};

	if (config.marketWatcher.enabled) {
		setInterval(this.updateOrders, config.marketWatcher.orders.updateInterval);
	}
};
