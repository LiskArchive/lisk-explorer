const transactions = require('../lib/api/transactions');
const handler = require('./handler');

module.exports = function (app) {
	const transactionsApi = new transactions(app);

	app.get('/api/getTransaction', (req, res, next) =>
		handler(transactionsApi, 'getTransaction', req.query.transactionId, req, res, next));

	app.get('/api/getUnconfirmedTransactions', (req, res, next) =>
		handler(transactionsApi, 'getUnconfirmedTransactions', undefined, req, res, next));

	app.get('/api/getLastTransactions', (req, res, next) =>
		handler(transactionsApi, 'getLastTransactions', undefined, req, res, next));

	app.get('/api/getTransactionsByAddress', (req, res, next) =>
		handler(transactionsApi, 'getTransactionsByAddress', req.query, req, res, next));

	app.get('/api/getTransactionsByBlock', (req, res, next) =>
		handler(
			transactionsApi,
			'getTransactionsByBlock',
			{
				blockId: req.query.blockId,
				offset: req.query.offset,
				limit: req.query.limit,
			},
			req,
			res,
			next));
};
