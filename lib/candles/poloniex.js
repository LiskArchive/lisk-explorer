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
