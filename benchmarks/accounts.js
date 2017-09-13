module.exports = [
	{
		endpoint: 'getAccount',
		service: 'accounts',
		params: { address: '12907382053545086321L' },
	}, {
		endpoint: 'getTopAccounts',
		service: 'accounts',
		params: { offset: 0, limit: 50 },
		data: data => data.accounts.length,
	},
];
