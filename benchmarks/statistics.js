const handler = require('./handler');

module.exports = function (app, api) {
	const statisticsApi = new api.statistics(app);

	this.getBlocks = deferred =>
		handler(statisticsApi, 'getBlocks', undefined, deferred, 'blocks', data => data.volume.blocks);

	this.getLastBlock = deferred =>
		handler(statisticsApi, 'getLastBlock', undefined, deferred, 'blocks');

	this.getPeers = (deferred) => {
		statisticsApi.locator.disabled = true;
		handler(statisticsApi, 'getPeers', undefined, deferred, 'peers', data => (data.list.connected.length + data.list.disconnected.length));
	};
};

