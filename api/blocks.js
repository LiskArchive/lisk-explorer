const blocks = require('../lib/api/blocks');
const handler = require('./handler');

module.exports = function (app) {
	const blocksApi = new blocks(app);

	app.get('/api/getLastBlocks', (req, res, next) =>
		handler(blocksApi, 'getLastBlocks', req.query.n, req, res, next));

	app.get('/api/getBlock', (req, res, next) =>
		handler(blocksApi, 'getBlock', req.query.blockId, req, res, next));

	app.get('/api/getHeight', (req, res, next) =>
		handler(blocksApi, 'getHeight', req.query.height, req, res, next));

	app.get('/api/getBlockStatus', (req, res, next) =>
		handler(blocksApi, 'getBlockStatus', undefined, req, res, next));
};
