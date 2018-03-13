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
const config = require('../config');
const client = require('../redis')(config);
const candles = require('../lib/candles');
const async = require('async');

module.exports = function (grunt) {
	grunt.registerTask('candles:build', 'Build exchange candle data.', function () {
		const done = this.async();

		async.series([
			(callback) => {
				// Skip exchange if not enabled
				if (!config.marketWatcher.exchanges.poloniex) {
					return callback(null);
				}

				const poloniex = new candles.poloniex(client, config.marketWatcher.candles.poloniex);

				return poloniex.buildCandles((err, res) => {
					if (err) {
						return callback(err);
					}
					return callback(null, res);
				});
			},
			(callback) => {
				// Skip exchange if not enabled
				if (!config.marketWatcher.exchanges.bittrex) {
					return callback(null);
				}

				const bittrex = new candles.bittrex(client);

				return bittrex.buildCandles((err, res) => {
					if (err) {
						return callback(err);
					}
					return callback(null, res);
				});
			},
		],
		(err) => {
			if (err) {
				grunt.log.error(err);
				done(false);
			} else {
				done(true);
			}
		});
	});

	grunt.registerTask('candles:update', 'Update exchange candle data.', function () {
		const done = this.async();

		async.series([
			(callback) => {
				// Skip exchange if not enabled
				if (!config.marketWatcher.exchanges.poloniex) {
					return callback(null);
				}

				const poloniex = new candles.poloniex(client);

				return poloniex.updateCandles((err, res) => {
					if (err) {
						return callback(err);
					}
					return callback(null, res);
				});
			},
			(callback) => {
				// Skip exchange if not enabled
				if (!config.marketWatcher.exchanges.bittrex) {
					return callback(null);
				}

				const bittrex = new candles.bittrex(client);

				return bittrex.updateCandles((err, res) => {
					if (err) {
						return callback(err);
					}
					return callback(null, res);
				});
			},
		],
		(err) => {
			if (err) {
				grunt.log.error(err);
				done(false);
			} else {
				done(true);
			}
		});
	});
};
