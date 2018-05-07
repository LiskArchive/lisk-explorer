
const defaultMockPath = 'http://localhost:8585';

module.exports = {
	tickers: {
		bitfinex_BTCUSD: `${defaultMockPath}/tickers/bitfinex_BTCUSD.json?`,
		bitstamp_BTCUSD: `${defaultMockPath}/tickers/bitstamp_BTCUSD.json?`,
		bitfinex_BTCEUR: `${defaultMockPath}/tickers/bitfinex_BTCEUR.json?`,
		bitmarket_BTCEUR: `${defaultMockPath}/tickers/bitmarket_BTCEUR.json?`,
		bitmarket_BTCPLN: `${defaultMockPath}/tickers/bitmarket_BTCPLN.json?`,
		exmo_ALL: `${defaultMockPath}/tickers/exmo_ALL.json?`,
		poloniex_ALL: `${defaultMockPath}/tickers/poloniex_ALL.json?`,
	},
	candles: {
		bittrex: `${defaultMockPath}/candles/bittrex.json?`,
		poloniex: `${defaultMockPath}/candles/poloniex.json?`,
	},
	orders: {
		bittrex: `${defaultMockPath}/orders/bittrex.json?`,
		poloniex: `${defaultMockPath}/orders/poloniex.json?`,
	},
};
