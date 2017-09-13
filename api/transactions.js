module.exports = [
	{
		path: 'getTransaction',
		service: 'transactions',
		params: req => req.query.transactionId,
	}, {
		path: 'getUnconfirmedTransactions',
		service: 'transactions',
		params: () => undefined,
	}, {
		path: 'getLastTransactions',
		service: 'transactions',
		params: () => undefined,
	}, {
		path: 'getTransactionsByAddress',
		service: 'transactions',
		params: req => req.query,
	}, {
		path: 'getTransactionsByBlock',
		service: 'transactions',
		params: req => ({
			blockId: req.query.blockId,
			offset: req.query.offset,
			limit: req.query.limit,
		}),
	},
];
