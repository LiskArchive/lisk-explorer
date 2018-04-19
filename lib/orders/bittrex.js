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
const request = require('request');
const util = require('util');
const _ = require('underscore');
const logger = require('../../utils/logger');

function BittrexOrders(...rest) {
	const self = this;

	AbstractOrders.apply(this, rest);

	this.name = 'bittrex';
	this.key = `${this.name}Orders`;
	this.url = 'https://bittrex.com/api/v1.1/public/getorderbook?market=BTC-LSK&type=both&depth=50';
	this.limit = 100;

	this.reverse = {
		bids: true,
		asks: false,
	};

	this.retrieveOrders = function (cb) {
		logger.info('Orders:', 'Retrieving orders from', `${self.name}...`);

		request.get({
			url: self.url,
			json: true,
		}, (err, resp, body) => {
			if (err || resp.statusCode !== 200) {
				return cb(err || 'Response was unsuccessful');
			}

			const validateResult = (result) => {
				if (!Array.isArray(result.buy)) return false;
				if (!Array.isArray(result.sell)) return false;
				return true;
			};

			const message = body.message;
			if (message) {
				return cb(message);
			} else if (_.isObject(body) && _.isObject(body.result) && validateResult(body.result)) {
				return cb(null, self.acceptOrders(body));
			}
			return cb('Invalid data received');
		});
	};

	this.acceptOrders = function (data) {
		let asks = [];
		let bids = [];

		const buyKeys = Object.keys(data.result.buy);
		for (let i = 0; i < buyKeys.length; i++) {
			bids.push([data.result.buy[buyKeys[i]].Rate, data.result.buy[buyKeys[i]].Quantity]);
		}

		const sellKeys = Object.keys(data.result.buy);
		for (let i = 0; i < sellKeys.length; i++) {
			asks.push([data.result.sell[sellKeys[i]].Rate, data.result.sell[sellKeys[i]].Quantity]);
		}

		bids = (self.reverse.bids) ? bids.reverse() : bids;
		bids = bids.slice(0, self.limit);
		asks = (self.reverse.asks) ? asks.reverse() : asks;
		asks = asks.slice(0, self.limit);

		return self.addDepth({
			asks: self.translateOrders(asks),
			bids: self.translateOrders(bids),
		});
	};

	this.addDepth = function (data) {
		const depth = [];
		let bidVolume = 0;
		let askVolume = 0;

		_.each(data.bids, (bid) => {
			bidVolume += (bid[0] * bid[1]);
		});

		_.each(data.bids, (bid) => {
			depth.push({
				price: bid[0].toFixed(8),
				amount: bid[1].toFixed(8),
				bid: (bidVolume -= (bid[0] * bid[1])).toFixed(8),
				ask: null,
			});
		});

		_.each(data.asks, (ask) => {
			depth.push({
				price: ask[0].toFixed(8),
				amount: ask[1].toFixed(8),
				ask: (askVolume += (ask[0] * ask[1])).toFixed(8),
				bid: null,
			});
		});

		if (self.reverse.bids) {
			data.bids = data.bids.reverse();
		}

		if (self.reverse.asks) {
			data.asks = data.asks.reverse();
		}

		data.depth = depth;
		return data;
	};
}

util.inherits(BittrexOrders, AbstractOrders);
module.exports = BittrexOrders;
