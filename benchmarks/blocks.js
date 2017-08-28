const logger = require('../utils/logger');

module.exports = function (app, api) {
	const blocks = new api.blocks(app);

	this.getLastBlocks = (deferred) => {
		blocks.getLastBlocks(
			1,
			(data) => {
				deferred.resolve();
				logger.error('blocks.getLastBlocks ~>', 'Error retrieving blocks:', data.error);
			},
			(data) => {
				deferred.resolve();
				logger.info('blocks.getLastBlocks ~>', data.blocks.length, 'blocks retrieved in', String(deferred.elapsed), 'seconds');
			},
		);
	};

	this.getBlock = (deferred) => {
		blocks.getBlock(
			'13592630651917052637',
			(data) => {
				deferred.resolve();
				logger.error('blocks.getBlock ~>', 'Error retrieving block:', data.error);
			},
			() => {
				deferred.resolve();
				logger.info('blocks.getBlock ~>', 'block retrieved in', String(deferred.elapsed), 'seconds');
			},
		);
	};

	this.getBlockStatus = (deferred) => {
		blocks.getBlockStatus(
			(data) => {
				deferred.resolve();
				logger.error('blocks.getBlockStatus ~>', 'Error retrieving status:', data.error);
			},
			() => {
				deferred.resolve();
				logger.info('blocks.getBlockStatus ~>', 'status retrieved in', String(deferred.elapsed), 'seconds');
			},
		);
	};
};
