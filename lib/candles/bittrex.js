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
const AbstractCandles = require('./abstract');
const util = require('util');
const _ = require('underscore');
const async = require('async');
const logger = require('../../utils/logger');

function BittrexCandles(...rest) {
	AbstractCandles.apply(this, rest);

	const self = this;

	this.name = 'bittrex';
	this.key = `${this.name}Candles`;
	this.url = 'https://bittrex.com/Api/v2.0/pub/market/GetTicks?marketName=BTC-LSK&tickInterval=fiveMin';
	this.start = '';
	this.last = null;

	this.response = {
		error: 'message',
		data: 'result',
	};

	this.candle = {
		date: 'T',
		open: 'O',
		close: 'C',
		high: 'H',
		low: 'L',
		liskVolume: 'V',
		btcVolume: 'BV',
	};

	this.validationKey = 'T';

	this.parser = function (period) {
		const sortedPeriodList = _.sortBy(period, t => this.parseDate(t[this.candle.date]).unix());
		const earliestDateItem = sortedPeriodList[0];
		const latestDateItem = sortedPeriodList[sortedPeriodList.length - 1];

		return {
			timestamp: this.parseDate(earliestDateItem[this.candle.date]).unix(),
			date: this.parseDate(earliestDateItem[this.candle.date]).toDate(),
			high: _.max(period, t => parseFloat(t[this.candle.high]))[this.candle.high],
			low: _.min(period, t => parseFloat(t[this.candle.low]))[this.candle.low],
			open: earliestDateItem[this.candle.open],
			close: latestDateItem[this.candle.close],
			liskVolume: _.reduce(period, (memo, t) =>
				(memo + parseFloat(t[this.candle.liskVolume])), 0.0).toFixed(8),
			btcVolume: _.reduce(period, (memo, t) =>
				(memo + (parseFloat(t[this.candle.btcVolume]))), 0.0)
				.toFixed(8),
		};
	};

	this.acceptTrades = function (results, data) {
		return results.concat(data.reverse());
	};

	const _dropAndSave = function (trades, cb) {
		async.waterfall([
			function (waterCb) {
				return self.dropCandles(waterCb);
			},
			function (waterCb) {
				return self.saveCandles(trades, waterCb);
			},
		],
		(err, results) => {
			if (err) {
				return cb(err);
			}
			return cb(null, results);
		});
	};

	const _updateCandles = function (trades, cb) {
		logger.info(`Candles: Updating ${self.duration} candles for ${self.name}...`);

		async.waterfall([
			function (waterCb) {
				return self.groupTrades(trades, waterCb);
			},
			function (results, waterCb) {
				return self.sumTrades(results, waterCb);
			},
			function (results, waterCb) {
				return self.fillGaps(results, waterCb);
			},
			function (results, waterCb) {
				return _dropAndSave(results, waterCb);
			},
		],
		(err, results) => {
			if (err) {
				return cb(err);
			}
			return cb(null, results);
		});
	};

	this.updateCandles = function (cb) {
		async.waterfall([
			function (waterCb) {
				return self.retrieveTrades(null, null, waterCb);
			},
			function (trades, waterCb) {
				async.eachSeries(self.durations, (duration, eachCb) => {
					self.duration = duration;
					return _updateCandles(trades, eachCb);
				}, (err) => {
					if (err) {
						return waterCb(err);
					}
					return waterCb(null);
				});
			},
		],
		(err) => {
			if (err) {
				return cb(err);
			}
			return cb(null);
		});
	};
}

util.inherits(BittrexCandles, AbstractCandles);
module.exports = BittrexCandles;
