module.exports = [
	{
		endpoint: 'getTransaction',
		service: 'transactions',
		title: 'transaction',
		params: '6538470051935780976',
	}, {
		endpoint: 'getUnconfirmedTransactions',
		service: 'transactions',
		params: undefined,
		data: data => data.transactions.length,
	}, {
		endpoint: 'getLastTransactions',
		service: 'transactions',
		params: undefined,
		data: data => data.transactions.length,
	}, {
		endpoint: 'getTransactionsByAddress',
		service: 'transactions',
		params: {
			address: '12907382053545086321C',
			offset: 0,
			limit: 100,
		},
		data: data => data.transactions.length,
	}, {
		endpoint: 'getTransactionsByBlock',
		service: 'transactions',
		params: {
			blockId: '13592630651917052637',
			offset: 0,
			limit: 100,
		},
		data: data => data.transactions.length,
	},
];
