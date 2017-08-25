

let async = require('async'),
	request = require('request'),
	_ = require('underscore'),
	logger = require('../../utils/logger');

function AbstractOrders(client) {
	const self = this;

	this.name = 'exchange';
	this.key = `${this.name}Orders`;
	this.url = '';
	this.limit = 100;

	this.reverse = {
		bids: true,
		asks: true,
	};

	this.response = {
		error: 'message',
		asks: 'asks',
		bids: 'bids',
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

			const message = body[self.response.error];
			if (message) {
				return cb(message);
			} else if (_.isObject(body)) {
				return cb(null, self.acceptOrders(body));
			}
			return cb('Invalid data received');
		});
	};

	this.acceptOrders = function (data) {
		_.each([self.response.asks, self.response.bids], (k) => {
			if (!_.isArray(data[k])) { data[k] = []; }
		});

		let asks = self.response.asks,
			bids = self.response.bids;

		data[bids] = (self.reverse.bids) ? data[bids].reverse() : data[bids];
		data[bids] = data[bids].slice(0, self.limit);
		data[asks] = (self.reverse.asks) ? data[asks].reverse() : data[asks];
		data[asks] = data[asks].slice(0, self.limit);

		return self.addDepth({
			asks: self.translateOrders(data[asks]),
			bids: self.translateOrders(data[bids]),
		});
	};

	this.translateOrders = function (orders) {
		return _.map(orders, o => [Number(o[0]), Number(o[1])]);
	};

	this.addDepth = function (data) {
		let depth = [],
			bidVolume = 0,
			askVolume = 0;

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
			data[self.response.bids] = data[self.response.bids].reverse();
		}

		data.depth = depth;
		return data;
	};

	this.saveOrders = function (orders, cb) {
		const multi = client.multi();

		multi.SET(self.key, JSON.stringify(orders));
		multi.exec((err, replies) => {
			if (err) {
				return cb(err);
			}
			logger.info('Orders:', 'Orders saved successfully');
			return cb(null, orders);
		});
	};

	this.restoreOrders = function (cb) {
		client.GET(self.key, (err, reply) => {
			if (err) {
				return cb(err);
			}
			if (reply) {
				reply = JSON.parse(reply.toString());
			} else {
				reply = {};
			}
			logger.info('Orders:', 'Orders restored successfully');
			return cb(null, reply);
		});
	};

	this.updateOrders = function (cb) {
		logger.info('Orders:', 'Updating orders for', `${self.name}...`);

		async.waterfall([
			function (callback) {
				return self.retrieveOrders(callback);
			},
			function (results, callback) {
				return self.saveOrders(results, callback);
			},
		],
		(err, results) => {
			if (err) {
				return cb(err);
			}
			return cb(null, results);
		});
	};
}

module.exports = AbstractOrders;
