const handler = require('./handler');

module.exports = function (app, api) {
	const blocksApi = new api.blocks(app);

	this.getLastBlocks = deferred =>
		handler(blocksApi, 'getLastBlocks', 1, deferred, 'blocks', data => data.blocks.length);

	this.getBlock = deferred =>
		handler(blocksApi, 'getBlock', '13592630651917052637', deferred, 'blocks');

	this.getBlockStatus = deferred =>
		handler(blocksApi, 'getBlockStatus', undefined, deferred, 'blocks');
};
