module.exports = [
	{
		endpoint: 'getActive',
		service: 'delegates',
		params: undefined,
		data: data => data.delegates.length,
	}, {
		endpoint: 'getStandby',
		service: 'delegates',
		params: 0,
		data: data => data.delegates.length,
	}, {
		endpoint: 'getLatestRegistrations',
		service: 'delegates',
		params: undefined,
		title: 'registrations',
		data: data => data.transactions.length,
	}, {
		endpoint: 'getLatestVotes',
		service: 'delegates',
		params: undefined,
		title: 'votes',
		data: data => data.transactions.length,
	}, {
		endpoint: 'getLastBlock',
		service: 'delegates',
		title: 'block',
		params: undefined,
	},
];
