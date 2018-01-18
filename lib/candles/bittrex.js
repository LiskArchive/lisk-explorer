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

function BittrexCandles(...rest) {
	AbstractCandles.apply(this, rest);

	this.name = 'bittrex';
	this.key = `${this.name}Candles`;
	this.url = 'https://bittrex.com/api/v1.1/public/getmarkethistory?market=BTC-LSK&count=50';
	this.start = '';
	this.last = null;

	this.response = {
		error: 'message',
		data: 'result',
	};

	this.candle = {
		id: 'Id',
		date: 'TimeStamp',
		price: 'Price',
		amount: 'Quantity',
	};

	this.acceptTrades = function (results, data) {
		return results.concat(data.reverse());
	};
}

util.inherits(BittrexCandles, AbstractCandles);
module.exports = BittrexCandles;
