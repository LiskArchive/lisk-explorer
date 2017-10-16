const request = require('request');
const _ = require('underscore');
const async = require('async');

module.exports = function (app) {
	const getErrorMessage = (body) => {
		let message = 'Response was unsuccessful';
		if (body && body.error) {
			message = body.error;
		}
		return message;
	};
	this.getBlockHeight = function (error, success) {
		request.get({
			url: `${app.get('lisk address')}/blocks/status`,
			json: true,
		}, (err, response, body) => {
			if (response.statusCode === 200) {
				return success({ success: true, height: body.height });
			}
			return error({ success: false, error: body.error });
		});
	};

	this.getBlockByHeight = function (height, error, success) {
		request.get({
			url: `${app.get('lisk address')}/blocks?height=${height}`,
			json: true,
		}, (err, response, body) => {
			if (response.statusCode === 200) {
				return success({
					success: true,
					blockId: body.blocks[0].blockId,
					height: body.blocks[0].height,
				});
			}
			return error({ success: false, error: 'No block at specified height' });
		});
	};


	function Blocks() {
		this.offset = function (n) {
			n = parseInt(n, 10);

			if (isNaN(n) || n < 0) {
				return 0;
			}
			return n;
		};

		this.getDelegate = function (result, cb) {
			if (!result) {
				cb(null, result);
			}
			const block = result;

			return request.get({
				url: `${app.get('lisk address')}/delegates/?publicKey=${block.generatorPublicKey}`,
				json: true,
			}, (err, response, body) => {
				if (response.statusCode === 200) {
					block.delegate = body.delegate;
				} else {
					block.delegate = null;
				}
				return cb(null, result);
			});
		};

		this.map = function (body) {
			return _.map(body.blocks, b => ({
				id: b.id,
				timestamp: b.timestamp,
				generator: b.generatorId,
				totalAmount: b.totalAmount,
				totalFee: b.totalFee,
				reward: b.reward,
				totalForged: b.totalForged,
				transactionsCount: b.numberOfTransactions,
				height: b.height,
				delegate: b.delegate,
			}));
		};

		this.pagination = function (n, height) {
			const pagination = {};
			pagination.currentPage = parseInt(n / 20, 10) + 1;

			let totalPages = parseInt(height / 20, 10);
			if (totalPages < height / 20) { totalPages++; }

			if (pagination.currentPage < totalPages) {
				pagination.before = true;
				pagination.previousPage = pagination.currentPage + 1;
			}

			if (pagination.currentPage > 0) {
				pagination.more = true;
				pagination.nextPage = pagination.currentPage - 1;
			}

			return pagination;
		};
	}

	this.getLastBlocks = function (n, error, success) {
		const blocks = new Blocks();

		this.getBlockHeight(
			data => error({ success: false, error: data.error }),
			(data) => {
				if (data.success === true) {
					return request.get({
						url: `${app.get('lisk address')}/blocks?sort=height:desc&limit=20&offset=${blocks.offset(n)}`,
						json: true,
					}, (err, response, body) => {
						if (response.statusCode === 200) {
							return async.forEach(body.blocks, (b, cb) => {
								blocks.getDelegate(b, cb);
							}, () => success({
								success: true,
								blocks: blocks.map(body),
								pagination: blocks.pagination(n, data.height),
							}));
						}
						return error({ success: false, error: body.error });
					});
				}
				return error({ success: false, error: data.error });
			});
	};

	function Block() {
		const makeBody = function (body, height) {
			// @todo remove assignments with #285
			const block = Object.assign({}, body.blocks[0], body.blocks[0].forged);
			block.id = block.blockId;
			block.previousBlock = block.previousBlockId;
			block.generatorId = block.generatorAddress;
			delete block.forged;
			delete block.blockId;
			delete block.previousBlockId;
			delete block.generatorAddress;

			block.confirmations = (height - block.height) + 1;
			block.payloadHash = new Buffer(block.payloadHash).toString('hex');

			body.blocks[0] = block;
			return body;
		};

		this.getBlock = function (blockId, height, cb) {
			return request.get({
				url: `${app.get('lisk address')}/blocks/?blockId=${blockId}`,
				json: true,
			}, (err, response, body) => {
				if (response.statusCode === 200) {
					return cb(null, makeBody(body, height));
				}
				return cb(getErrorMessage(body));
			});
		};

		this.getDelegate = function (result, cb) {
			if (!result.blocks) {
				cb(null, result);
			}
			const block = result.blocks[0];

			request.get({
				url: `${app.get('lisk address')}/delegates/?publicKey=${block.generatorPublicKey}`,
				json: true,
			}, (err, response, body) => {
				if (response.statusCode === 200) {
					block.delegate = body.delegates[0];
					// @todo remove by #285
					block.delegate.missedblocks = block.delegate.missedBlocks;
					block.delegate.producedblocks = block.delegate.producedBlocks;
				} else {
					block.delegate = null;
				}
				return cb(null, { block });
			});
		};
	}

	this.getBlock = function (blockId, error, success) {
		const block = new Block();

		if (!blockId) {
			return error({ success: false, error: 'Missing/Invalid blockId parameter' });
		}
		return this.getBlockHeight(
			data => error({ success: false, error: data.error }),
			(data) => {
				if (data.success === false) {
					return error({ success: false, error: data.error });
				}
				return async.waterfall([
					function (cb) {
						block.getBlock(blockId, data.height, cb);
					},
					function (result, cb) {
						block.getDelegate(result, cb);
					},
				], (err, result) => {
					if (err) {
						return error({ success: false, error: err });
					}
					result.success = true;
					return success(result);
				});
			});
	};

	this.getHeight = function (height, error, success) {
		const block = new Block();

		if (!height) {
			return error({ success: false, error: 'Missing/Invalid height parameter' });
		}
		return this.getBlockByHeight(height,
			data => error({ success: false, error: data.error }),
			(data) => {
				if (data.success === false) {
					return error({ success: false, error: data.error });
				}
				return async.waterfall([
					function (cb) {
						block.getBlock(data.blockId, data.height, cb);
					},
					function (result, cb) {
						block.getDelegate(result, cb);
					},
				], (err, result) => {
					if (err) {
						return error({ success: false, error: err });
					}
					result.success = true;
					return success(result);
				});
			});
	};

	this.getBlockStatus = function (error, success) {
		request.get({
			url: `${app.get('lisk address')}/blocks/getStatus`,
			json: true,
		}, (err, response, body) => {
			if (response.statusCode === 200) {
				return success(body);
			}
			return error({ success: false, error: body.error });
		});
	};
};
