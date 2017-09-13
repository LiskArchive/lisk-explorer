module.exports = [
	{
		endpoint: 'getLastBlock',
		service: 'statistics',
		title: 'blocks',
		params: undefined,
		data: data => data.volume.blocks,
	}, {
		endpoint: 'getBlocks',
		service: 'statistics',
		title: 'blocks',
		params: undefined,
	}, {
		endpoint: 'getPeers',
		service: 'statistics',
		title: 'peers',
		params: undefined,
		data: data => (data.list.connected.length + data.list.disconnected.length),
	},
];
