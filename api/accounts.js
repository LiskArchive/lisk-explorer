module.exports = [
	{
		path: 'getAccount',
		service: 'accounts',
		params: req => req.query,
	}, {
		path: 'getTopAccounts',
		service: 'accounts',
		params: req => ({
			offset: req.query.offset,
			limit: req.query.limit,
		}),
	},
];
