module.exports = [
	{
		path: 'delegates/getActive',
		service: 'delegates',
		params: () => undefined,
	}, {
		path: 'delegates/getStandby',
		service: 'delegates',
		params: req => req.query.n,
	}, {
		path: 'delegates/getLatestRegistrations',
		service: 'delegates',
		params: () => undefined,
	}, {
		path: 'delegates/getLatestVotes',
		service: 'delegates',
		params: () => undefined,
	}, {
		path: 'delegates/getLastBlock',
		service: 'delegates',
		params: () => undefined,
	}, {
		path: 'delegates/getLastBlocks',
		service: 'delegates',
		params: req => req.query.n,
	}, {
		path: 'delegates/getNextForgers',
		service: 'delegates',
		params: () => undefined,
	}, {
		path: 'delegates/getDelegateProposals',
		service: 'delegates',
		params: () => undefined,
	},
];
