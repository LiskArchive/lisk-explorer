module.exports = [
	{
		endpoint: 'getLastBlocks',
		service: 'blocks',
		params: 1,
		data: data => data.blocks.length,
	}, {
		endpoint: 'getBlock',
		service: 'blocks',
		params: '13592630651917052637',
	}, {
		endpoint: 'getBlockStatus',
		service: 'blocks',
		params: undefined,
	},
];
