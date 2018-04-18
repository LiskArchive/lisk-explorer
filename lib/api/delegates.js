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
const stringSimilarity = require('string-similarity');

module.exports = function (app) {
	const knowledge = app.knownAddresses;

	const parseDelegates = (delegates) => {
		_.each(delegates, (d) => {
			d.productivity = Math.abs(parseFloat(d.productivity)) || 0.0;
		});

		return delegates;
	};

	function blocksMapper(o) {
		if (!o) return {};
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
		if (!o) return {};
		return {
			address: o.address || o.account.address,
			approval: o.approval,
			missedblocks: o.missedBlocks,
			producedblocks: o.producedBlocks,
			productivity: o.productivity,
			publicKey: o.publicKey || o.account.publicKey,
			rate: o.rank,
			username: o.username,
			vote: o.vote,
		};
	}

	function delegatesTimestampMapper(o) {
		if (!o) return {};
		return {
			username: o.asset.delegate.username,
			publicKey: o.asset.delegate.publicKey,
			address: o.asset.delegate.address,
			registeredAt: o.timestamp,
		};
	}

	function transactionsMapper(o) {
		if (!o) return {};
		return {
			amount: o.amount,
			asset: o.asset,
			blockId: o.blockId,
			confirmations: o.confirmations,
			delegate: o.delegate,
			fee: o.fee,
			height: o.height,
			id: o.id,
			recipientId: o.recipientId,
			senderId: o.senderId,
			senderPublicKey: o.senderPublicKey,
			signature: o.signature,
			signatures: [o.signature],
			timestamp: o.timestamp,
			type: o.type,
		};
	}

	function Delegates() {
		this.getAllDelegates = function (limit, offset, cb) {
			request.get({
				url: `${app.get('lisk address')}/delegates/?sort=rank:asc&limit=${limit}&offset=${offset}`,
				json: true,
			}, (err, response, body) => {
				if (err || response.statusCode !== 200) {
					return cb(err || 'Response was unsuccessful');
				} else if (body.data && Array.isArray(body.data)) {
					return cb(null, body.data.map(delegatesMapper));
				}
				return cb(body.error);
			});
		};

		this.getDelegatesFromTimestamp = function (fromTimestamp, limit, offset, cb) {
			request.get({
				url: `${app.get('lisk address')}/transactions/?sort=timestamp:desc&type=2&limit=${limit}&offset=${offset}&fromTimestamp=${fromTimestamp || 0}`,
				json: true,
			}, (err, response, body) => {
				if (err || response.statusCode !== 200) {
					return cb(err || 'Response was unsuccessful');
				} else if (body.data && Array.isArray(body.data)) {
					return cb(null, body.data.map(delegatesTimestampMapper));
				}
				return cb(body.error);
			});
		};
	}

	this.getAllDelegates = function (cb) {
		const delegates = new Delegates();

		const limit = 100;
		let offset = 0;
		let delegatesList = [];

		return async.doUntil(
			(next) => {
				delegates.getAllDelegates(limit, offset, next);
			},
			(data) => {
				delegatesList = _.union(delegatesList, data);
				offset += limit;
				return data.length < limit;
			},
			(err) => {
				if (err) {
					return cb(err || 'Response was unsuccessful');
				}

				return cb(null, delegatesList);
			});
	};

	this.getDelegatesFromTimestamp = function (fromTimestamp, cb) {
		const delegates = new Delegates();

		const limit = 100;
		let offset = 0;
		let delegatesList = [];

		return async.doUntil(
			(next) => {
				delegates.getDelegatesFromTimestamp(fromTimestamp, limit, offset, next);
			},
			(data) => {
				delegatesList = _.union(delegatesList, data);
				offset += limit;
				return data.length < limit;
			},
			(err) => {
				if (err) {
					return cb(err || 'Response was unsuccessful');
				}

				return cb(null, delegatesList);
			});
	};

	function Active() {
		this.getActive = function (cb) {
			request.get({
				url: `${app.get('lisk address')}/delegates/?sort=rank:asc&limit=101`,
				json: true,
			}, (err, response, body) => {
				if (err || response.statusCode !== 200) {
					return cb(err || 'Response was unsuccessful');
				} else if (body.data && Array.isArray(body.data)) {
					const delegates = parseDelegates(body.data.map(delegatesMapper));
					return cb(null, {
						success: true,
						delegates,
						totalCount: knowledge.totalDelegates,
					});
				}
				return cb({ success: false, error: 'Failed to get data' });
			});
		};

		this.getForged = function (delegate, cb) {
			request.get({
				url: `${app.get('lisk address')}/delegates/${delegate.address}/forging_statistics`,
				json: true,
			}, (err, response, body) => {
				if (err || response.statusCode !== 200) {
					return cb(err || 'Response was unsuccessful');
				} else if (body && body.data) {
					delegate.forged = body.data.forged;
					return cb();
				}
				delegate.forged = false;
				return cb();
			});
		};
	}

	this.getActive = function (query, error, success) {
		const delegates = new Active();

		async.waterfall([
			(cb) => {
				delegates.getActive(cb);
			},
			(result, cb) => {
				async.each(result.delegates, (delegate, callback) => {
					delegates.getForged(delegate, callback);
				}, (err) => {
					if (err) {
						return cb(err);
					}
					return cb(null, result);
				});
			},
		], (err, result) => {
			if (err) {
				return error({ success: false, error: err });
			}
			return success(result);
		});
	};

	function Standby(n) {
		this.limit = 20;
		this.offset = parseInt(n, 10);
		this.actualOffset = (isNaN(this.offset)) ? 101 : this.offset + 101;

		this.pagination = function () {
			const pagination = {};
			pagination.currentPage = parseInt(this.offset / this.limit, 10) + 1;

			if (pagination.currentPage > 1) {
				pagination.before = true;
				pagination.previousPage = pagination.currentPage - 1;
			}

			pagination.more = true;
			pagination.nextPage = pagination.currentPage + 1;

			return pagination;
		};
	}

	this.getStandby = function (n, error, success) {
		const delegates = new Standby(n);

		request.get({
			url: `${app.get('lisk address')}/delegates/?sort=rank:asc&limit=${delegates.limit}&offset=${delegates.actualOffset}`,
			json: true,
		}, (err, response, body) => {
			if (err || response.statusCode !== 200) {
				return error({ success: false, error: (err || 'Response was unsuccessful') });
			} else if (Array.isArray(body.data)) {
				return success({
					success: true,
					delegates: parseDelegates(body.data.map(delegatesMapper)),
					totalCount: Number.MAX_SAFE_INTEGER,
					pagination: delegates.pagination(),
				});
			}
			return error({ success: false, error: body.error });
		});
	};

	function Registrations() {
		this.getTransactions = function (cb) {
			request.get({
				url: `${app.get('lisk address')}/transactions/?sort=timestamp:desc&limit=5&type=2`,
				json: true,
			}, (err, response, body) => {
				if (err || response.statusCode !== 200) {
					return cb(err || 'Response was unsuccessful');
				} else if (body.data) {
					return cb(null, body.data);
				}
				return cb(body.error);
			});
		};

		this.getDelegate = function (tx, cb) {
			request.get({
				url: `${app.get('lisk address')}/delegates?publicKey=${tx.senderPublicKey}`,
				json: true,
			}, (err, response, body) => {
				if (err || response.statusCode !== 200) {
					return cb(err || 'Response was unsuccessful');
				} else if (body.error && body.error === 'Delegate not found') {
					tx.delegate = {};
					return cb(null, tx.delegate);
				} else if (Array.isArray(body.data)) {
					tx.delegate = body.data.map(delegatesMapper)[0];
					return cb(null, tx.delegate);
				}
				return cb(body.error);
			});
		};
	}

	this.getLatestRegistrations = function (query, error, success) {
		const registrations = new Registrations();

		async.waterfall([
			(cb) => {
				registrations.getTransactions(cb);
			},
			(transactions, cb) => {
				async.each(transactions, (tx, callback) => {
					registrations.getDelegate(tx, callback);
				}, (err) => {
					if (err) {
						return cb(err);
					}
					return cb(null, transactions);
				});
			},
		], (err, transactions) => {
			if (err) {
				return error({ success: false, error: err });
			} else if (Array.isArray(transactions)) {
				return success({ success: true, transactions: transactions.map(transactionsMapper) });
			}
			return error({ success: false, error: 'General error' });
		});
	};

	function Votes() {
		this.getVotes = (cb) => {
			request.get({
				url: `${app.get('lisk address')}/transactions/?sort=timestamp:desc&limit=5&type=3`,
				json: true,
			}, (err, response, body) => {
				if (err || response.statusCode !== 200) {
					return cb(err || 'Response was unsuccessful');
				} else if (body.data && Array.isArray(body.data)) {
					return cb(null, body.data);
				}
				return cb(body.error);
			});
		};

		this.getDelegate = (tx, cb) => {
			request.get({
				url: `${app.get('lisk address')}/delegates?publicKey=${tx.senderPublicKey}`,
				json: true,
			}, (err, response, body) => {
				if (err || response.statusCode !== 200) {
					tx.delegate = null;
				} else if (body && Array.isArray(body.data)) {
					tx.delegate = delegatesMapper(body.data[0]);
				}
				return cb();
			});
		};
	}

	this.getLatestVotes = function (query, error, success) {
		const votes = new Votes();

		async.waterfall([
			(cb) => {
				votes.getVotes(cb);
			},
			(transactions, cb) => {
				async.each(transactions,
					(tx, callback) => { votes.getDelegate(tx, callback); },
					() => cb(null, transactions));
			},
		], (err, transactions) => {
			if (err) {
				return error({ success: false, error: err });
			}
			return success({ success: true, transactions });
		});
	};

	this.getNextForgersCall = (limit, offset, cb) => {
		request.get({
			url: `${app.get('lisk address')}/delegates/forgers?limit=${limit}&offset=${offset}`,
			json: true,
		}, (err, response, body) => {
			if (err || response.statusCode !== 200) {
				return cb(err || 'Response was unsuccessful');
			} else if (body && Array.isArray(body.data)) {
				return cb(null, body.data);
			}
			return cb(body.error || 'Response was unsuccessful');
		});
	};

	this.getNextForgers = function (temp, error, success) {
		// it requires 2 calls because core api limits the response to 100 items
		return async.parallel([
			(callback) => {
				this.getNextForgersCall(100, 0, callback);
			},
			(callback) => {
				this.getNextForgersCall(100, 100, callback);
			},
		], (err, result) => {
			if (err) {
				return error({ success: false, error: err });
			}
			const delegates = _.flatten(result).map(o => o.publicKey);
			return success({ success: true, delegates });
		});
	};

	function LastBlock() {
		this.getBlock = function (cb) {
			request.get({
				url: `${app.get('lisk address')}/blocks?&sort=height:desc&limit=1`,
				json: true,
			}, (err, response, body) => {
				if (err || response.statusCode !== 200) {
					return cb(err || 'Response was unsuccessful');
				} else if (body && _.size(body.data) === 1) {
					const block = [body.data[0]].map(blocksMapper)[0];
					return cb(null, _.extend({ success: true }, block));
				}
				return cb(body.error);
			});
		};

		this.getDelegate = function (block, cb) {
			request.get({
				url: `${app.get('lisk address')}/delegates?publicKey=${block.generatorPublicKey}`,
				json: true,
			}, (err, response, body) => {
				if (err || response.statusCode !== 200) {
					return cb(err || 'Response was unsuccessful');
				} else if (body && Array.isArray(body.data)) {
					block.delegate = [body.data[0]].map(delegatesMapper)[0];
				} else {
					block.delegate = null;
				}
				return cb(null, block);
			});
		};
	}

	this.getLastBlock = function (query, error, success) {
		const lastBlock = new LastBlock();

		async.waterfall([
			function (cb) {
				lastBlock.getBlock(cb);
			},
			function (block, cb) {
				lastBlock.getDelegate(block, cb);
			},
		], (err, result) => {
			if (err) {
				return error({ success: false, error: err });
			}
			return success({ success: true, block: result });
		});
	};

	this.getLastBlocks = function (params, error, success) {
		if (!params.publicKey) {
			return error({ success: false, error: 'Missing/Invalid publicKey parameter' });
		}
		if (isNaN(parseInt(params.limit, 10)) || params.limit > 20) {
			params.limit = 20;
		}
		return request.get({
			url: `${app.get('lisk address')}/blocks?sort=height:desc&generatorPublicKey=${params.publicKey}&limit=${params.limit}`,
			json: true,
		}, (err, response, body) => {
			if (err || response.statusCode !== 200) {
				return error({ success: false, error: err });
			}
			body.blocks = Array.isArray(body.data) ? body.data : [];
			return success({ success: true, blocks: body.blocks.map(blocksMapper) });
		});
	};

	this.getSearch = function (params, error, success) {
		if (!params || !params.match(/^(?![0-9]{1,21}[L]$)[0-9a-z.]+/i)) {
			return error({ success: false, error: 'Missing/Invalid username parameter' });
		}
		return request.get({
			url: `${app.get('lisk address')}/delegates?search=${params}`,
			json: true,
		}, (err, response, body) => {
			if (response.statusCode !== 200) {
				return error({ success: false, error: 'Bad response from Core' });
			}
			if (!body.data || !body.data[0]) {
				return error({ success: false, error: 'Delegate not found' });
			}

			const results = body.data.map(delegate => ({
				address: delegate.address || delegate.account.address,
				username: delegate.username,
				similarity: stringSimilarity.compareTwoStrings(params, delegate.username),
			})).sort((a, b) => b.similarity - a.similarity);

			return success({ success: true, results });
		});
	};
};
