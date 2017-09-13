module.exports = [
	{
		path: 'exchanges/getOrders',
		service: 'orders',
		params: req => req.query.e,
	}, {
		path: 'exchanges/getCandles',
		service: 'candles',
		params: req => ({ e: req.query.e, d: req.query.d }),
	}, {
		path: 'exchanges/getStatistics',
		service: 'candles',
		params: req => req.query.e,
	},
];
