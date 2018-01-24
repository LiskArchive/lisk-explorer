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
const candles = require('../candles');
const moment = require('moment');
const config = require('../../config');
const _ = require('underscore');
const async = require('async');

module.exports = function (app) {
	const exchanges = {
		poloniex: new candles.poloniex(app.locals.redis),
		bittrex: new candles.bittrex(app.locals.redis),
	};

	const validExchange = function (e) {
		if (!_.has(config.marketWatcher.exchanges, e) ||
			!config.marketWatcher.exchanges[e] ||
			!exchanges[e]) {
			return null;
		}
		return exchanges[e];
	};

	const validDuration = function (d) {
		// eslint-disable-next-line eqeqeq
		if (d != undefined && ['minute', 'hour', 'day'].includes(d)) {
			return d;
		}
		return 'minute';
	};

	const thisOptions = function (e, d) {
		const options = {
			exchange: validExchange(e),
			duration: validDuration(d),
		};

		if (options.duration === 'minute') {
			options.index = -1440;
			options.maxTime = moment().subtract(1, 'day');
		} else if (options.duration === 'hour') {
			options.index = -2016;
			options.maxTime = moment().subtract(3, 'month');
		} else if (options.duration === 'day') {
			options.index = -1095;
			options.maxTime = moment().subtract(3, 'years');
		}

		return options;
	};

	/**
	 * @todo I renamed the fist parameter from candles to _candles
	 * since it was already defined in the higher scope
	 */
	const rejectCandles = function (_candles, maxTime) {
		return _.reject(_candles, c => moment.unix(c.timestamp).isBefore(maxTime));
	};

	this.getCandles = function (params, error, success) {
		const options = thisOptions(params.e, params.d);

		if (options.exchange === null) {
			return error({ success: false, error: 'Invalid Exchange' });
		}

		if (!config.marketWatcher.enabled) {
			return success({ success: true, candles: [] });
		}

		return options.exchange.restoreCandles(options.duration, options.index, (err, reply) => {
			if (err) {
				return error({ success: false });
			}
			return success({
				success: true,
				timeframe: options.duration,
				exchange: options.exchange.name,
				candles: rejectCandles(reply, options.maxTime),
			});
		});
	};

	this.getStatistics = function (e, error, success) {
		const options = thisOptions(e, 'minute');

		if (options.exchange === null) {
			return error({ success: false, error: 'Invalid Exchange' });
		}

		if (!config.marketWatcher.enabled) {
			const statistics = {
				last: Number(0).toFixed(8),
				high: Number(0).toFixed(8),
				low: Number(0).toFixed(8),
				btcVolume: Number(0).toFixed(8),
				liskVolume: Number(0).toFixed(8),
				numTrades: 0,
			};

			return success({ success: true, statistics });
		}

		return async.parallel([
			function (callback) {
				options.exchange.restoreCandles(options.duration, options.index, (err, reply) => {
					if (err) {
						return callback(err);
					}
					return callback(null, rejectCandles(reply, options.maxTime));
				});
			},
			function (callback) {
				options.exchange.restoreCandles('minute', -1, (err, reply) => {
					if (err) {
						return callback(err);
					}
					return callback(null, reply[0]);
				});
			},
		],
		(err, results) => {
			if (err || !results[0] || !results[1]) {
				return error({ success: false });
			}
			let statistics = {
				last: _.last(results[0]),
				high: _.max(results[0], c => parseFloat(c.high)).high,
				low: _.min(results[0], c => parseFloat(c.low)).low,
				btcVolume: _.reduce(results[0], (memo, t) =>
					(memo + parseFloat(t.btcVolume)), 0.0).toFixed(8),
				liskVolume: _.reduce(results[0], (memo, t) =>
					(memo + parseFloat(t.liskVolume)), 0.0).toFixed(8),
				numTrades: _.reduce(results[0], (memo, t) =>
					(memo + parseInt(t.numTrades, 10)), 0),
			};

			statistics = {
				last: statistics.last ? statistics.last.close : results[1].close,
				high: statistics.high ? statistics.high : Number(0).toFixed(8),
				low: statistics.low ? statistics.low : Number(0).toFixed(8),
				btcVolume: statistics.btcVolume,
				liskVolume: statistics.liskVolume,
				numTrades: statistics.numTrades,
			};

			return success({ success: true, exchange: options.exchange.name, statistics });
		});
	};
};
