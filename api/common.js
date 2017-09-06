const defaultApi = require('../lib/api');
const handler = require('./handler');

module.exports = function (app) {
	const commonApi = new defaultApi.common(app, defaultApi);

	app.get('/api/version', (req, res) => {
		const data = commonApi.version();
		return res.json(data);
	});

	app.get('/api/getPriceTicker', (req, res, next) =>
		handler(commonApi, 'getPriceTicker', undefined, req, res, next));

	app.get('/api/search', (req, res, next) =>
		handler(commonApi, 'search', req.query.id, req, res, next));
};
