const statistics = require('../lib/api/statistics');
const handler = require('./handler');

module.exports = function (app) {
	const statisticsApi = new statistics(app);

	app.get('/api/statistics/getLastBlock', (req, res, next) =>
		handler(statisticsApi, 'getLastBlock', req, res, next));

	app.get('/api/statistics/getBlocks', (req, res, next) =>
		handler(statisticsApi, 'getBlocks', req, res, next));

	app.get('/api/statistics/getPeers', (req, res, next) =>
		handler(statisticsApi, 'getPeers', req, res, next));
};

