const request = require('request');
const _ = require('underscore');
const util = require('util');
const async = require('async');
const logger = require('../logger');

module.exports = function (config) {
	// No need to init if exchange rates are disabled
	if (!config.exchangeRates.enabled) {
		return false;
	}

	const exchanges = {
		BTCUSD: {
			bitfinex: [
				'Bitfinex',
				'https://api.bitfinex.com/v1/pubticker/BTCUSD',
				(res, cb) => {
					if (res.message) {
						return cb(res.message);
					}
					return cb(null, res.last_price);
				},
			],
			bitstamp: [
				'Bitstamp',
				'https://www.bitstamp.net/api/v2/ticker/btcusd/',
				(res, cb) => cb(null, res.last),
			],
		},
		BTCEUR: {
			bitstamp: [
				'Bitstamp',
				'https://www.bitstamp.net/api/v2/ticker/btceur/',
				(res, cb) => cb(null, res.last),
			],
			bitmarket: [
				'Bitmarket',
				'https://www.bitmarket.pl/json/BTCEUR/ticker.json',
				(res, cb) => cb(null, res.last),
			],
		},
		BTCPLN: {
			bitmarket: [
				'Bitmarket',
				'https://www.bitmarket.pl/json/BTCPLN/ticker.json',
				(res, cb) => cb(null, res.last),
			],
		},
		BTCRUB: {
			exmo: [
				'Exmo',
				'https://api.exmo.com/v1/ticker/',
				(res, cb) => {
					if (res.error) {
						return cb(res.error);
					}
					return cb(null, res.BTC_RUB.last_trade);
				},
			],
		},
		BTCCNY: {
			cmp: [
				'Coinmarketcap',
				'https://api.coinmarketcap.com/v1/ticker/bitcoin/?convert=CNY',
				(res, cb) => {
					if (res.error) {
						return cb(res.error);
					}
					return cb(null, res[0].price_cny);
				},
			],
		},
		LSKBTC: {
			poloniex: [
				'Poloniex',
				'https://poloniex.com/public?command=returnTicker',
				(res, cb) => {
					if (res.error) {
						return cb(res.error);
					}
					return cb(null, res.BTC_LSK.last);
				},
			],
		},
		LSKCNY: {
			jubi: [
				'Jubi',
				'https://www.jubi.com/api/v1/ticker/?coin=lsk',
				(res, cb) => {
					if (res.last) {
						return cb(null, res.last);
					}
					return cb('Unable to get last price');
				},
			],
			bitbays: [
				'Bitbays',
				'https://bitbays.com/api/v1/ticker/?market=lsk_cny',
				(res, cb) => {
					if (res.status === 200 && res.message === 'ok' && res.result.last) {
						return cb(null, res.result.last);
					}
					return cb('Unable to get last price');
				},
			],
		},
	};

	const requestTicker = (options, cb) => {
		request.get({
			url: options[1],
			json: true,
		}, (err, response, body) => {
			if (err) {
				return cb(err);
			} else if (response.statusCode !== 200) {
				return cb(util.format('Response code: %s!', response.statusCode));
			}
			return options[2](body, cb);
		});
	};

	_.each(config.exchangeRates.exchanges, (coin1, key1) => {
		_.each(coin1, (exchange, key2) => {
			const pair = key1 + key2;

			if (!exchange) {
				return;
			}

			if (Object.keys(exchanges[pair]).indexOf(exchange) > -1) {
				logger.info('Exchange:', util.format('Configured [%s] as %s/%s exchange', exchange, key1, key2));
				config.exchangeRates.exchanges[key1][key2] = exchanges[pair][exchange];
				config.exchangeRates.exchanges[key1][key2].pair = pair;
			} else if (exchanges[pair]) {
				const exName = Object.keys(exchanges[pair])[0];
				const ex = exchanges[pair][exName];
				logger.error('Exchange:', util.format('Unrecognized %s/%s exchange', key1, key2));
				logger.error('Exchange:', util.format('Defaulting to [%s]', exName));
				config.exchangeRates.exchanges[key1][key2] = ex;
				config.exchangeRates.exchanges[key1][key2].pair = pair;
			} else {
				logger.error('Exchange:', util.format('Unrecognized %s/%s pair, deleted', key1, key2));
				/**
				 * @todo remove is never defined.
				 */
				// remove(config.exchangeRates.exchanges[key1][key2]);
			}
		});
	});

	return {
		getPriceTicker: (cb) => {
			const currency = {};
			const isNumeric = n => !isNaN(parseFloat(n)) && isFinite(n);

			async.forEachOf(config.exchangeRates.exchanges, (exchange, key1, seriesCb) => {
				currency[key1] = {};
				async.forEachOf(exchange, (exchange2, key2, seriesCb2) => {
					requestTicker(exchange2, (err, result) => {
						if (result && isNumeric(result)) {
							currency[key1][key2] = result;
						} else {
							logger.error(util.format('Cannot receive exchange rates for %s/%s pair from [%s], ignored', key1, key2, exchange2[0]));
						}
						seriesCb2(null, currency);
					});
				},
				() => {
					seriesCb(null, currency);
				});
			},
			() => {
				logger.error('Exchange rates:', currency);
				cb(null, currency);
			});
		},
	};
};
