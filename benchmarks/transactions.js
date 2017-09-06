const handler = require('./handler');

module.exports = function (app, api) {
	const transactionsApi = new api.transactions(app);

	this.getTransaction = deferred =>
		handler(transactionsApi, 'getTransaction', '6538470051935780976', deferred, 'transaction');

	this.getUnconfirmedTransactions = deferred =>
		handler(transactionsApi, 'getUnconfirmedTransactions', undefined, deferred, 'transactions', data => data.transactions.length);

	this.getLastTransactions = deferred =>
		handler(transactionsApi, 'getLastTransactions', undefined, deferred, 'transactions', data => data.transactions.length);

	this.getTransactionsByAddress = deferred =>
		handler(
			transactionsApi,
			'getTransactionsByAddress',
			{
				address: '12907382053545086321C',
				offset: 0,
				limit: 100,
			},
			deferred,
			'transactions',
			data => data.transactions.length);

	this.getTransactionsByBlock = deferred =>
		handler(
			transactionsApi,
			'getTransactionsByBlock',
			{
				blockId: '13592630651917052637',
				offset: 0,
				limit: 100,
			},
			deferred,
			'transactions',
			data => data.transactions.length);
};

