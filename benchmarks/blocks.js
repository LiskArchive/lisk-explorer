

module.exports = function (app, api) {
	const blocks = new api.blocks(app);

	this.getLastBlocks = function (deferred) {
		blocks.getLastBlocks(
			1,
			(data) => {
				deferred.resolve();
				console.log('blocks.getLastBlocks ~>', 'Error retrieving blocks:', data.error);
			},
			(data) => {
				deferred.resolve();
				console.log('blocks.getLastBlocks ~>', data.blocks.length, 'blocks retrieved in', String(deferred.elapsed), 'seconds');
			},
		);
	};

	this.getBlock = function (deferred) {
		blocks.getBlock(
			'13592630651917052637',
			(data) => {
				deferred.resolve();
				console.log('blocks.getBlock ~>', 'Error retrieving block:', data.error);
			},
			(data) => {
				deferred.resolve();
				console.log('blocks.getBlock ~>', 'block retrieved in', String(deferred.elapsed), 'seconds');
			},
		);
	};

	this.getBlockStatus = function (deferred) {
		blocks.getBlockStatus(
			(data) => {
				deferred.resolve();
				console.log('blocks.getBlockStatus ~>', 'Error retrieving status:', data.error);
			},
			(data) => {
				deferred.resolve();
				console.log('blocks.getBlockStatus ~>', 'status retrieved in', String(deferred.elapsed), 'seconds');
			},
		);
	};
};
