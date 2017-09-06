const config = require('../config');
const candles = require('../lib/api/candles');
const orders = require('../lib/api/orders');
const handler = require('./handler');

module.exports = function (app) {
	const ordersApi = new orders(app);
	const candlesApi = new candles(app);

	app.get('/api/exchanges', (req, res) => {
		const result = {
			success: true,
			enabled: config.marketWatcher.enabled,
			exchanges: config.marketWatcher.enabled ? config.marketWatcher.exchanges : [],
		};
		return res.json(result);
	});

	app.get('/api/exchanges/getOrders', (req, res, next) =>
		handler(ordersApi, 'getOrders', req.query.e, req, res, next));

	app.get('/api/exchanges/getCandles', (req, res, next) =>
		handler(candlesApi, 'getCandles', { e: req.query.e, d: req.query.d }, req, res, next));

	app.get('/api/exchanges/getStatistics', (req, res, next) =>
		handler(candlesApi, 'getStatistics', req.query.e, req, res, next));
};
