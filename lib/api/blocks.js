/*
 * LiskHQ/lisk-explorer
 * Copyright © 2018 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 *
 */
const request = require('request');
const _ = require('underscore');
const async = require('async');

module.exports = function (app) {
	this.getBlockHeight = function (error, success) {
		request.get({
			url: `${app.get('lisk address')}/node/status`,
			json: true,
		}, (err, response, body) => {
			if (err) {
				return error({ success: false, error: err.message });
			} else if (response.statusCode === 200) {
				return success({ success: true, height: body.data.height });
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
				if (Array.isArray(body.data) && body.data.length > 0) {
					return success({
						success: true,
						blockId: body.data[0].id,
						height: body.data[0].height,
					});
				}
			}
			return error({ success: false, error: 'No block at specified height' });
		});
	};

	function blocksMapper(o) {
		return {
			blockSignature: o.blockSignature,
			confirmations: o.confirmations,
			generatorId: o.generatorAddress,
			generatorPublicKey: o.generatorPublicKey,
			height: o.height,
			id: o.id,
			numberOfTransactions: o.numberOfTransactions,
			payloadHash: o.payloadHash,
			payloadLength: o.payloadLength,
			previousBlock: o.previousBlockId,
			reward: o.reward,
			timestamp: o.timestamp,
			totalAmount: o.totalAmount,
			totalFee: o.totalFee,
			totalForged: o.totalForged,
			version: o.version,
		};
	}

	function delegatesMapper(o) {
		return {
			address: o.account.address,
			approval: o.approval,
			missedblocks: o.missedBlocks,
			producedblocks: o.producedBlocks,
			productivity: o.productivity,
			publicKey: o.account.publicKey,
			rate: o.rank,
			username: o.username,
			vote: o.vote,
		};
	}

	function Blocks() {
		this.offset = function (n) {
			n = parseInt(n, 10);

			if (isNaN(n) || n < 0) {
				return 0;
			}
			return n;
		};

		this.getDelegate = function (result, cb) {
			const block = result;

			return request.get({
				url: `${app.get('lisk address')}/delegates?publicKey=${block.generatorPublicKey}`,
				json: true,
			}, (err, response, body) => {
				if (response.statusCode === 200 && Array.isArray(body.data)) {
					block.delegate = body.data[0];
				} else {
					block.delegate = null;
				}
				return cb(null, result);
			});
		};

		this.map = function (body) {
			return body.data.map(b => ({
				id: b.id,
				timestamp: b.timestamp,
				generator: b.generatorAddress,
				totalAmount: b.totalAmount,
				totalFee: b.totalFee,
				reward: b.reward,
				totalForged: b.totalForged,
				transactionsCount: b.numberOfTransactions,
				height: b.height,
				delegate: b.generatorAddress,
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
						if (err || response.statusCode !== 200) {
							return error({ success: false, error: (err || 'Response was unsuccessful') });
						} else if (Array.isArray(body.data)) {
							return async.forEach(body.data, (b, cb) => {
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
			const b = body.data[0];

			b.confirmations = (height - b.height) + 1;
			b.payloadHash = new Buffer(b.payloadHash).toString('hex');

			body.block = b;
			delete body.data;
			return body;
		};

		this.getBlock = function (blockId, height, cb) {
			request.get({
				url: `${app.get('lisk address')}/blocks?blockId=${blockId}`,
				json: true,
			}, (err, response, body) => {
				if (err || response.statusCode !== 200) {
					return cb(err || 'Response was unsuccessful');
				} else if (body.data && Array.isArray(body.data) && body.data.length === 1) {
					const mappedBody = body.data.map(blocksMapper);
					return cb(null, makeBody({ data: mappedBody }, height));
				} else if (body.data && Array.isArray(body.data) && body.data.length === 0) {
					return cb('Empty response');
				}
				return cb('Unknown error');
			});
		};

		/* eslint-disable consistent-return */
		this.getDelegate = function (result, cb) {
			if (!result.block) {
				return cb(null, result);
			}
			const block = result.block;

			request.get({
				url: `${app.get('lisk address')}/delegates?publicKey=${block.generatorPublicKey}`,
				json: true,
			}, (err, response, body) => {
				if (err || response.statusCode !== 200) {
					return cb(err || 'Response was unsuccessful');
				} else if (body.data && Array.isArray(body.data) && body.data.length > 0) {
					const delegateData = [body.data[0]].map(delegatesMapper)[0];
					block.delegate = delegateData;
				} else {
					block.delegate = null;
				}
				return cb(null, result);
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
					return success(_.extend({ success: true }, result));
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
					return success(_.extend({ success: true }, result));
				});
			});
	};

	this.getBlockStatus = function (query, error, success) {
		function getStatus(cb) {
			request.get({
				url: `${app.get('lisk address')}/node/status`,
				json: true,
			}, (err, response, body) => {
				if (err || response.statusCode !== 200) {
					return error({ success: false, error: (err || 'Response was unsuccessful') });
				} else if (body.data) {
					return cb(null, body.data);
				}
				return error({ success: false, error: body.error });
			});
		}

		function getConstants(cb) {
			request.get({
				url: `${app.get('lisk address')}/node/constants`,
				json: true,
			}, (err, response, body) => {
				if (err || response.statusCode !== 200) {
					return error({ success: false, error: (err || 'Response was unsuccessful') });
				} else if (body.data) {
					return cb(null, body.data);
				}
				return error({ success: false, error: body.error });
			});
		}

		async.parallel({
			status: getStatus,
			constants: getConstants,
		}, (err, cb) => success(
			_.extend(
				{ success: true },
				cb.status,
				cb.constants,
				{
					fee: Number(cb.constants.fees.send),
					milestone: Number(cb.constants.milestone),
					reward: Number(cb.constants.reward),
					supply: Number(cb.constants.supply),
				} // eslint-disable-line comma-dangle
			) // eslint-disable-line comma-dangle
		));
	};
};
