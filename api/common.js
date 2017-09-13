module.exports = [
	{
		path: 'getPriceTicker',
		service: '',
		params: () => undefined,
	}, {
		path: 'search',
		service: '',
		params: req => req.query.id,
	},
];
