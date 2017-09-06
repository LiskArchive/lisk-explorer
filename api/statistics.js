const statistics = require('../lib/api/statistics');
// const handler = require('./handler');

module.exports = function (app) {
	const statisticsApi = new statistics(app);

	const handler = (api, endpoint, req, res) => {
		api[endpoint].call(
			api,
			(data) => { res.json(data); },
			(data) => { res.json(data); });
	};

	app.get('/api/statistics/getLastBlock', (req, res) =>
		handler(statisticsApi, 'getLastBlock', res));

	app.get('/api/statistics/getBlocks', (req, res) =>
		handler(statisticsApi, 'getBlocks', res));

	app.get('/api/statistics/getPeers', (req, res) =>
		handler(statisticsApi, 'getPeers', res));
};

