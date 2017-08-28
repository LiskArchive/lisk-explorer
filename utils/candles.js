const candles = require('../lib/candles');
const async = require('async');
const logger = require('./logger');

module.exports = function (config, client) {
	let running = false;
	const poloniex = new candles.poloniex(client);
	const bittrex = new candles.bittrex(client);

	this.updateCandles = function () {
		if (running) {
			logger.error('Candles:', 'Update already in progress');
			return;
		}
		running = true;

		async.series([
			(callback) => {
				if (!config.marketWatcher.exchanges.poloniex) {
					callback(null);
				} else {
					poloniex.updateCandles((err, res) => {
						if (err) {
							callback(err);
						} else {
							callback(null, res);
						}
					});
				}
			},
			(callback) => {
				if (!config.marketWatcher.exchanges.bittrex) {
					callback(null);
				} else {
					bittrex.updateCandles((err, res) => {
						if (err) {
							callback(err);
						} else {
							callback(null, res);
						}
					});
				}
			},
		],
		(err) => {
			if (err) {
				logger.error('Candles:', 'Error updating candles:', err);
			} else {
				logger.info('Candles:', 'Updated successfully');
			}
			running = false;
		});
	};

	if (config.marketWatcher.enabled) {
		setInterval(this.updateCandles, config.marketWatcher.candles.updateInterval);
	}
};
