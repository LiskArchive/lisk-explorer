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
const config = require('./config.global');

/**
 * CONFIGURATION
 */
config.host = '0.0.0.0'; // Interface to listen on, 0.0.0.0 to listen on all available
config.port = 6040; // Port to listen on

/**
 * LISK node
 */
config.lisk.host = process.env.LISK_HOST || '127.0.0.1';
config.lisk.port = process.env.LISK_PORT || 4000;

/**
 * FreeGeoIP server
 */
config.freegeoip.host = process.env.FREEGEOIP_HOST || '127.0.0.1';
config.freegeoip.port = process.env.FREEGEOIP_PORT || 8080;

/**
 * Redis server
 */
config.redis.host = process.env.REDIS_HOST || '127.0.0.1';
config.redis.port = process.env.REDIS_PORT || 6379;
config.redis.db = process.env.REDIS_DB || 0;
config.redis.password = '';

// Time in seconds to store cache in Redis
config.cacheTTL = 20;

// Collect logs (true - enabled, false - disabled)
config.log.enabled = true;
// Output for logs - can be device file or ordinary path
config.log.file = './logs/explorer.log';
// Log level - (trace, debug, info, warn, error)
config.log.level = 'info';

/**
 * Header price tickers, Currency switcher
 */
// Exchange rates support (true - enabled, false - disabled)
config.exchangeRates.enabled = true;
// Interval in ms for checking exchange rates (default: 30 seconds)
config.exchangeRates.updateInterval = 30000;

// Configuration for different currency pairs, set false to disable pair
// LSK/BTC pair, supported: poloniex
config.exchangeRates.exchanges.LSK.BTC = 'poloniex';
// LSK/CNY pair, supported: jubi, bitbays
config.exchangeRates.exchanges.LSK.CNY = false;
// BTC/USD pair, supported: bitfinex, bitstamp, btce
config.exchangeRates.exchanges.BTC.USD = 'bitfinex';
// BTC/EUR pair, supported: bitstamp, bitmarket
config.exchangeRates.exchanges.BTC.EUR = 'bitstamp';
// BTC/RUB pair, supported: btce, exmo
config.exchangeRates.exchanges.BTC.RUB = 'btce';
// BTC/PLN pair, supported: bitmarket
config.exchangeRates.exchanges.BTC.PLN = false;

/**
 * Market watcher
 */
// Market watcher support (true - enabled, false - disabled)
config.marketWatcher.enabled = true;
// Poloniex exchange support (true - enabled, false - disabled)
config.marketWatcher.exchanges.poloniex = true;
// Bittrex exchange support (true - enabled, false - disabled);
config.marketWatcher.exchanges.bittrex = true;
// Interval in ms for updating candlestick data (default: 30 seconds)
config.marketWatcher.candles.updateInterval = 30000;
// Build candles based on trades form last 30 days
config.marketWatcher.candles.poloniex.buildTimeframe = 60 * 60 * 24 * 30;
// Interval in ms for updating order book data (default: 15 seconds)
config.marketWatcher.orders.updateInterval = 15000;

module.exports = config;
