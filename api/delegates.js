const delegates = require('../lib/api/delegates');
const handler = require('./handler');

module.exports = function (app) {
	const delegatesApi = new delegates(app);

	app.get('/api/delegates/getActive', (req, res, next) =>
		handler(delegatesApi, 'getActive', undefined, req, res, next));

	app.get('/api/delegates/getStandby', (req, res, next) =>
		handler(delegatesApi, 'getStandby', req.query.n, req, res, next));

	app.get('/api/delegates/getLatestRegistrations', (req, res, next) =>
		handler(delegatesApi, 'getLatestRegistrations', undefined, req, res, next));

	app.get('/api/delegates/getLatestVotes', (req, res, next) =>
		handler(delegatesApi, 'getLatestVotes', undefined, req, res, next));

	app.get('/api/delegates/getLastBlock', (req, res, next) =>
		handler(delegatesApi, 'getLastBlock', undefined, req, res, next));

	app.get('/api/delegates/getLastBlocks', (req, res, next) =>
		handler(
			delegatesApi,
			'getLastBlocks',
			{
				publicKey: req.query.publicKey,
				limit: req.query.limit,
			},
			req,
			res,
			next));

	app.get('/api/getSearch', (req, res, next) =>
		handler(delegatesApi, 'getSearch', req.query.q, req, res, next));

	app.get('/api/delegates/getNextForgers', (req, res, next) =>
		handler(delegatesApi, 'getNextForgers', undefined, req, res, next));

	app.get('/api/delegates/getDelegateProposals', (req, res, next) =>
		handler(delegatesApi, 'getDelegateProposals', undefined, req, res, next));
};
