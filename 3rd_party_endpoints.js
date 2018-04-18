
const bitMarketApiV1 = 'https://www.bitmarket.pl/json';
const bitStampApiV2 = 'https://www.bitstamp.net/api/v2';
const exmoApiV1 = 'https://api.exmo.com/v1';
const poloniexApiV1 = 'https://poloniex.com';
const bitFinexApiV1 = 'https://api.bitfinex.com/v1';
const bittrexApiV11 = 'https://bittrex.com/api/v1.1/public';
const bittrexApiV2 = 'https://bittrex.com/Api/v2.0/pub/market';

module.exports = {
	tickers: {
		bitfinex_BTCUSD: `${bitFinexApiV1}/pubticker/BTCUSD`,
		bitstamp_BTCUSD: `${bitStampApiV2}/ticker/btcusd/`,
		bitfinex_BTCEUR: `${bitStampApiV2}/ticker/btceur/`,
		bitmarket_BTCEUR: `${bitMarketApiV1}/BTCEUR/ticker.json`,
		bitmarket_BTCPLN: `${bitMarketApiV1}/BTCPLN/ticker.json`,
		exmo_ALL: `${exmoApiV1}/`,
		poloniex_ALL: `${poloniexApiV1}/public?command=returnTicker`,
	},
	candles: {
		bittrex: `${bittrexApiV2}/GetTicks?marketName=BTC-LSK&tickInterval=fiveMin`,
		poloniex: `${poloniexApiV1}/public?command=returnTradeHistory&currencyPair=BTC_LSK`,
	},
	orders: {
		bittrex: `${bittrexApiV11}/getorderbook?market=BTC-LSK&type=both&depth=50`,
		poloniex: `${poloniexApiV1}/public?command=returnOrderBook&currencyPair=BTC_LSK&depth=100`,
	},
};
