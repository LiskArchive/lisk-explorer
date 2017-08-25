

let config = require('../config'),
	client = require('../redis')(config),
	candles = require('../lib/candles'),
	async = require('async');

module.exports = function (grunt) {
	grunt.registerTask('candles:build', 'Build exchange candle data.', function () {
		const done = this.async();

		async.series([
			function (callback) {
				// Skip exchange if not enabled
				if (!config.marketWatcher.exchanges.poloniex) {
					return callback(null);
				}

				const poloniex = new candles.poloniex(client, config.marketWatcher.candles.poloniex);

				poloniex.buildCandles((err, res) => {
					if (err) {
						return callback(err);
					}
					return callback(null, res);
				});
			},
			function (callback) {
				// Skip exchange if not enabled
				if (!config.marketWatcher.exchanges.bittrex) {
					return callback(null);
				}

				const bittrex = new candles.bittrex(client);

				bittrex.buildCandles((err, res) => {
					if (err) {
						return callback(err);
					}
					return callback(null, res);
				});
			},
		],
		(err, results) => {
			if (err) {
				grunt.log.error(err);
				done(false);
			} else {
				done(true);
			}
		});
	});

	grunt.registerTask('candles:update', 'Update exchange candle data.', function () {
		const done = this.async();

		async.series([
			function (callback) {
				// Skip exchange if not enabled
				if (!config.marketWatcher.exchanges.poloniex) {
					return callback(null);
				}

				const poloniex = new candles.poloniex(client);

				poloniex.updateCandles((err, res) => {
					if (err) {
						return callback(err);
					}
					return callback(null, res);
				});
			},
			function (callback) {
				// Skip exchange if not enabled
				if (!config.marketWatcher.exchanges.bittrex) {
					return callback(null);
				}

				const bittrex = new candles.bittrex(client);

				bittrex.updateCandles((err, res) => {
					if (err) {
						return callback(err);
					}
					return callback(null, res);
				});
			},
		],
		(err, results) => {
			if (err) {
				grunt.log.error(err);
				done(false);
			} else {
				done(true);
			}
		});
	});
};
