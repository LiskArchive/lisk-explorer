const AbstractCandles = require('./abstract');
const util = require('util');

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
