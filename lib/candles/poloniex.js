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
const moment = require('moment');
const _ = require('underscore');
const util = require('util');
const config = require('../../config.js');

function PoloniexCandles(...rest) {
	AbstractCandles.apply(this, rest);

	const now = Math.floor(Date.now() / 1000);
	const params = rest[1];
	this.start = params && params.buildTimeframe ? (now - params.buildTimeframe) : null;
	this.end = now; // Current unix timestamp (in sec)

	this.name = 'poloniex';
	this.key = `${this.name}Candles`;
	this.url = config.endpoints.candles.poloniex;

	this.response = {
		error: 'error',
		data: null,
	};

	this.candle = {
		id: 'tradeID',
		date: 'date',
		price: 'rate',
		amount: 'amount',
	};

	this.validationKey = 'tradeID';

	this.parser = function (period) {
		return {
			timestamp: this.parseDate(period[0][this.candle.date]).unix(),
			date: this.parseDate(period[0][this.candle.date]).toDate(),
			high: _.max(period, t => parseFloat(t[this.candle.price]))[this.candle.price],
			low: _.min(period, t => parseFloat(t[this.candle.price]))[this.candle.price],
			open: _.first(period)[this.candle.price],
			close: _.last(period)[this.candle.price],
			liskVolume: _.reduce(period, (memo, t) =>
				(memo + parseFloat(t[this.candle.amount])), 0.0).toFixed(8),
			btcVolume: _.reduce(period, (memo, t) =>
				(memo + (parseFloat(t[this.candle.amount]) * parseFloat(t[this.candle.price]))), 0.0)
				.toFixed(8),
			firstTrade: _.first(period)[this.candle.id],
			lastTrade: _.last(period)[this.candle.id],
			nextEnd: this.nextEnd(period),
			numTrades: _.size(period),
		};
	};

	this.nextEnd = function (data) {
		return moment(_.first(data).date).subtract(1, 's').unix();
	};

	this.acceptTrades = function (results, data) {
		return results.concat(data.reverse());
	};
}

util.inherits(PoloniexCandles, AbstractCandles);
module.exports = PoloniexCandles;
