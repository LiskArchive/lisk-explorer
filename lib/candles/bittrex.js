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
