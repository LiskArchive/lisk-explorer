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

function PoloniexCandles(client, params, ...rest) {
	AbstractCandles.apply(this, [client, params, ...rest]);

	const now = Math.floor(Date.now() / 1000);
	this.start = params && params.buildTimeframe ? (now - params.buildTimeframe) : null;
	this.end = now; // Current unix timestamp (in sec)

	this.name = 'poloniex';
	this.key = `${this.name}Candles`;
	this.url = 'https://poloniex.com/public?command=returnTradeHistory&currencyPair=BTC_LSK';

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

	this.nextEnd = function (data) {
		return moment(_.first(data).date).subtract(1, 's').unix();
	};

	this.acceptTrades = function (results, data) {
		return results.concat(data.reverse());
	};
}

util.inherits(PoloniexCandles, AbstractCandles);
module.exports = PoloniexCandles;
