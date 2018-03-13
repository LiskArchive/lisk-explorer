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
const AbstractOrders = require('./abstract');
const util = require('util');

function PoloniexOrders(...rest) {
	AbstractOrders.apply(this, rest);

	this.name = 'poloniex';
	this.key = `${this.name}Orders`;
	this.url = 'https://poloniex.com/public?command=returnOrderBook&currencyPair=BTC_LSK&depth=100';

	this.reverse = {
		bids: true,
		asks: false,
	};

	this.response = {
		error: 'error',
		asks: 'asks',
		bids: 'bids',
	};
}

util.inherits(PoloniexOrders, AbstractOrders);
module.exports = PoloniexOrders;
