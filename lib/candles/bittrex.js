const AbstractCandles = require('./abstract');
const util = require('util');
const _ = require('underscore');
const async = require('async');
const request = require('request');
const moment = require('moment');
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
		// not provided by API
		numTrades: null,
		firstTrade: null,
		lastTrade: null,
		nextEnd: null,
	};

	this.parseCandles = function (results, cb) {
		const mapping = self.candle;

		let sum = _.map(results, (period) => {
			const sortedPeriodList = _.sortBy(period, t => self.parseDate(t[mapping.date]).unix());
			const earliestDateItem = sortedPeriodList[0];
			const latestDateItem = sortedPeriodList[sortedPeriodList.length - 1];

			return {
				timestamp: self.parseDate(earliestDateItem[mapping.date]).unix(),
				date: self.parseDate(earliestDateItem[mapping.date]).toDate(),
				high: _.max(period, t => parseFloat(t[mapping.high]))[mapping.high],
				low: _.min(period, t => parseFloat(t[mapping.low]))[mapping.low],
				open: earliestDateItem[mapping.open],
				close: latestDateItem[mapping.close],
				liskVolume: _.reduce(period, (memo, t) =>
					(memo + parseFloat(t[mapping.liskVolume])), 0.0).toFixed(8),
				btcVolume: _.reduce(period, (memo, t) =>
					(memo + (parseFloat(t[mapping.btcVolume]) * parseFloat(t[mapping.high] - t[mapping.low]))), 0.0)
					.toFixed(8),
				// firstTrade: _.first(period)[self.candle.id],
				// lastTrade: _.last(period)[self.candle.id],
				// nextEnd: self.nextEnd(period),
				// numTrades: _.size(period),
			};
		});

		sum = _.reject(sum, s => s.timestamp >= moment.utc().startOf(self.duration).unix());

		return cb(null, sum);
	};

	const _buildCandles = function (trades, cb) {
		logger.info(`Candles: Building ${self.duration} candles for ${self.name}...`);

		async.waterfall([
			function (waterCb) {
				self.client.DEL(self.candleKey(), (err) => {
					if (err) {
						return waterCb(err);
					}
					return waterCb();
				});
			},
			function (waterCb) {
				return self.groupTrades(trades, waterCb); // Should be groupCandles
			},
			function (results, waterCb) {
				return self.parseCandles(results, waterCb);
			},
			function (results, waterCb) {
				return self.saveCandles(results, waterCb);
			},
		],
		(err, results) => {
			if (err) {
				return cb(err);
			}
			return cb(null, results);
		});
	};

	this.buildCandles = function (cb) {
		async.waterfall([
			function (waterCb) {
				return self.retrieveTrades(waterCb);
			},
			function (trades, waterCb) {
				async.eachSeries(self.durations, (duration, eachCb) => {
					self.duration = duration;
					return _buildCandles(trades, eachCb);
				}, (err) => {
					if (err) {
						return waterCb(err);
					}
					return waterCb(null);
				});
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
				return self.parseCandles(results, waterCb);
			},
			function (results, waterCb) {
				return self.saveCandles(results, waterCb);
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
			function (callback) {
				self.duration = self.durations[0]; // Reset current duration
				self.client.LRANGE(self.candleKey(), -1, -1, (err, reply) => {
					if (err) {
						return callback(err);
					} else if (_.size(reply) === 0) {
						return callback(`No data was found for: ${self.name}`);
					}
					self.last = JSON.parse(reply);
					return callback(null, self.last);
				});
			},
			function (last, waterCb) {
				return self.retrieveTrades(waterCb);
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

	this.retrieveTrades = function (cb) {	// the name should be retrieveCandles or retrieveData
		let found = false;
		let results = [];

		logger.info(`Candles: Retrieving candles from ${self.name}...`);

		async.doUntil(
			(next) => {
				request.get({
					url: self.url,
				}, (err, resp, body) => {
					if (err || resp.statusCode !== 200) {
						return next(err || 'Response was unsuccessful');
					}

					let json;
					try {
						json = JSON.parse(body);
					} catch (jsonError) {
						return next(`Error while parsing JSON: ${jsonError.message}`);
					}

					const message = json[self.response.error];
					if (message) {
						return next(message);
					}

					const data = self.rejectTrades(json[self.response.data] || json);
					if (!self.validData(data)) {
						logger.error('Candles:', 'Invalid data received');
						return next();
					}

					if (self.validTrades(results, data)) {
						results = self.acceptTrades(results, data);
						return next();
					}
					found = true;
					return next();
				});
			},
			() => found,
			(err) => {
				if (err) {
					return cb(`Error retrieving trades: ${err}`);
				}
				logger.info(`Candles: ${results.length.toString()} candles retrieved in total`);
				return cb(null, results);
			});
	};

	this.validData = function (data) {
		if (_.size(data) > 0) {
			return _.first(data)[self.candle.date];
		}
		return true;
	};

	this.validTrades = function (results, data) {
		// TODO: check that one
		const any = _.size(data) > 0;

		if (any && _.size(results) > 0) {
			const firstLast = _.first(results)[self.candle.id] !== _.last(data)[self.candle.id];
			const lastFirst = _.last(results)[self.candle.id] !== _.first(data)[self.candle.id];

			return (firstLast && lastFirst);
		}
		return any;
	};

	this.acceptTrades = function (results, data) {
		return results.concat(data.reverse());
	};
}

util.inherits(BittrexCandles, AbstractCandles);
module.exports = BittrexCandles;
