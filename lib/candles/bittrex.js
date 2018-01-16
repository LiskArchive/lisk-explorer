const AbstractCandles = require('./abstract');
const util = require('util');
const _ = require('underscore');

function BittrexCandles(...rest) {
	AbstractCandles.apply(this, rest);

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
		const sortedPeriodList = _.sortBy(period, t => self.parseDate(t[this.candle.date]).unix());
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
				(memo + (parseFloat(t[this.candle.btcVolume]) *
				parseFloat(t[this.candle.high] - t[this.candle.low]))), 0.0)
				.toFixed(8),
		};
	};

	this.acceptTrades = function (results, data) {
		return results.concat(data.reverse());
	};
}

util.inherits(BittrexCandles, AbstractCandles);
module.exports = BittrexCandles;
