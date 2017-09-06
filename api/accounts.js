const accounts = require('../lib/api/accounts');
const handler = require('./handler');

module.exports = function (app) {
	const accountApi = new accounts(app);

	app.get('/api/getAccount', (req, res, next) =>
		handler(accountApi, 'getAccount', req.query, req, res, next));

	app.get('/api/getTopAccounts', (req, res, next) =>
		handler(
			accountApi,
			'getTopAccounts',
			{
				offset: req.query.offset,
				limit: req.query.limit,
			},
			req,
			res,
			next));
};
