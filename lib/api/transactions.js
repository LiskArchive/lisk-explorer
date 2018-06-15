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
const logger = require('../../utils/logger');
const coreUtils = require('../../utils/core.js');

module.exports = function (app) {
	const self = this;
	const delegateCache = [];
	// const exchange = app.exchange;
	const knowledge = app.knownAddresses;

	const param = (p, d) => {
		p = parseInt(p, 10);

		if (isNaN(p) || p < 0) {
			return d;
		}
		return p;
	};

	const concatenate = function (transactions, body) {
		transactions = transactions.concat(body.transactions);
		transactions.sort((a, b) => {
			if (a.timestamp > b.timestamp) {
				return -1;
			} else if (a.timestamp < b.timestamp) {
				return 1;
			}
			return 0;
		});

		let max = 10;
		if (transactions.length < max) {
			max = transactions.length;
		}

		return transactions.slice(0, 20);
	};

	const setDelegateToCache = function (delegate, tmpDelegateCache) {
		// Storing to global delegate cache
		if (delegateCache && !tmpDelegateCache && delegate && delegate.address
			&& delegateCache[delegate.address] === undefined) {
			logger.debug(`Storing global cache for: ${delegate.address}`);
			delegateCache[delegate.address] = delegate;
			return true;
		}

		// Storing to tmp delegate cache
		if (tmpDelegateCache && delegate && tmpDelegateCache[delegate] === undefined) {
			logger.debug(`Storing tmp cache for: ${delegate}`);
			tmpDelegateCache[delegate] = null;
			return tmpDelegateCache;
		}

		return false;
	};

	const getDelegateFromCache = function (address, tmpDelegateCache) {
		// Checking global delegate cache
		if (delegateCache && delegateCache[address] !== undefined) {
			logger.debug(`Using global cache for: ${address}`);
			return delegateCache[address];
		}

		// Checking tmp delegate cache
		if (tmpDelegateCache && tmpDelegateCache[address] !== undefined) {
			logger.debug(`Using tmp cache for: ${address}`);
			return tmpDelegateCache[address];
		}

		return undefined;
	};

	const getSenderDelegate = function (transaction, cb, tmpDelegateCache) {
		if (!transaction.senderPublicKey) {
			transaction.senderDelegate = null;
			return cb(null, transaction);
		}

		const found = getDelegateFromCache(coreUtils.parseAddress(transaction.senderId),
			tmpDelegateCache);
		if (found !== undefined) {
			transaction.senderDelegate = found;
			return cb(null, transaction);
		}

		return request.get({
			url: `${app.get('lisk address')}/api/delegates/get?publicKey=${transaction.senderPublicKey}`,
			json: true,
		}, (err, response, body) => {
			if (err || response.statusCode !== 200) {
				transaction.senderDelegate = null;
				return cb(null, transaction);
			} else if (body.success === true && body.delegate && body.delegate.address) {
				transaction.senderDelegate = body.delegate;
				setDelegateToCache(transaction.senderDelegate);
				return cb(null, transaction);
			}
			transaction.senderDelegate = null;
			setDelegateToCache(transaction.senderId, tmpDelegateCache);
			return cb(null, transaction);
		});
	};

	const getRecipientPublicKey = function (transaction, cb, tmpDelegateCache) {
		if (!transaction.recipientId || transaction.type !== 0) {
			transaction.recipientPublicKey = null;
			return cb(null, transaction);
		}

		const found = getDelegateFromCache(transaction.recipientId, tmpDelegateCache);
		if (found !== undefined) {
			transaction.recipientPublicKey = (found ? found.publicKey : null);
			transaction.recipientDelegate = found;
			return cb(null, transaction);
		}

		return request.get({
			url: `${app.get('lisk address')}/api/accounts/getPublicKey?address=${coreUtils.parseAddress(transaction.recipientId)}`,
			json: true,
		}, (err, response, body) => {
			if (err || response.statusCode !== 200) {
				transaction.recipientPublicKey = null;
				return cb(null, transaction);
			} else if (body.success === true && body.publicKey) {
				transaction.recipientPublicKey = body.publicKey;
				return cb(null, transaction);
			}
			transaction.recipientPublicKey = null;
			return cb(null, transaction);
		});
	};

	const getRecipientDelegate = function (transaction, cb, tmpDelegateCache) {
		if (!transaction.recipientPublicKey) {
			transaction.recipientDelegate = null;
			return cb(null, transaction);
		}

		return request.get({
			url: `${app.get('lisk address')}/api/delegates/get?publicKey=${transaction.recipientPublicKey}`,
			json: true,
		}, (err, response, body) => {
			if (err || response.statusCode !== 200) {
				transaction.recipientDelegate = null;
				return cb(null, transaction);
			} else if (body.success === true && body.delegate && body.delegate.address) {
				transaction.recipientDelegate = body.delegate;
				setDelegateToCache(transaction.recipientDelegate);
				return cb(null, transaction);
			}
			transaction.recipientDelegate = null;
			setDelegateToCache(transaction.recipientId, tmpDelegateCache);
			return cb(null, transaction);
		});
	};

	const processTransaction = function (tx, cb) {
		// Gathering more information about transaction, we skip errors here
		async.waterfall([
			function (waterCb) {
				waterCb(null, knowledge.inTx(tx));
			},
			getSenderDelegate,
			getRecipientPublicKey,
			getRecipientDelegate,
		], (err, result) => cb(null, result));
	};

	const processTransactions = function (transactions, cb) {
		const tmpDelegateCache = [];

		// Gathering more information about transactions, we skip errors here
		async.eachSeries(transactions, (tx, seriesCb) => {
			async.waterfall([
				function (waterCb) {
					waterCb(null, knowledge.inTx(tx));
				},
				function (result, waterCb) {
					getSenderDelegate(result, waterCb, tmpDelegateCache);
				},
				function (result, waterCb) {
					getRecipientPublicKey(result, waterCb, tmpDelegateCache);
				},
				function (result, waterCb) {
					getRecipientDelegate(result, waterCb, tmpDelegateCache);
				},
			], (err, result) => {
				seriesCb(null, result);
			});
		}, () => cb(null, transactions));
	};

	const Transaction = function () {
		this.getDelegate = function (forger, cb) {
			request.get({
				url: `${app.get('lisk address')}/api/delegates/get?publicKey=${forger.publicKey}`,
				json: true,
			}, (err, response, body) => {
				if (err || response.statusCode !== 200) {
					return cb(err || 'Response was unsuccessful');
				} else if (body.success === true) {
					forger.delegate = body.delegate;
				} else {
					forger.delegate = null;
				}
				return cb(null, forger);
			});
		};
	};

	this.getTransaction = function (transactionId, error, success, url) {
		let confirmed = false;
		if (!url) {
			confirmed = true;
			url = '/api/transactions/get?id=';
		}
		if (!transactionId) {
			return error({ success: false, error: 'Missing/Invalid transactionId parameter' });
		}

		return async.waterfall([
			function (waterCb) {
				request.get({
					url: app.get('lisk address') + url + transactionId,
					json: true,
				}, (err, response, body) => {
					if (err || response.statusCode !== 200) {
						return error({ success: false, error: (err || 'Response was unsuccessful') });
					} else if (body.success === true) {
						return waterCb(null, body.transaction);
					} else if (confirmed) {
						return self.getUnconfirmedTransaction(transactionId, error, success);
					}
					return error({ success: false, error: body.error });
				});
			},
			processTransaction,
		], (err, transaction) => {
			if (err) {
				return error({ success: false, error: err });
			}

			const t = new Transaction();

			if (transaction.votes) {
				return async.waterfall([
					(cb) => {
						if (transaction.votes.added.length) {
							const added = [];
							_.each(transaction.votes.added, (vote) => {
								added.push({ publicKey: vote });
							});

							return async.forEach(added, (add, callback) => {
								t.getDelegate(add, callback);
							}, () => {
								transaction.votes.added = added;
								return cb(null, transaction);
							});
						}
						transaction.votes.added = null;
						return cb(null, transaction);
					},
					(result, cb) => {
						if (result.votes.deleted.length) {
							const deleted = [];
							_.each(result.votes.deleted, (vote) => {
								deleted.push({ publicKey: vote });
							});

							return async.forEach(deleted, (add, callback) => {
								t.getDelegate(add, callback);
							}, () => {
								result.votes.deleted = deleted;
								return cb(null, result);
							});
						}
						result.votes.deleted = null;
						return cb(null, result);
					},
				], (innerErr, result) => {
					if (err) {
						return error({ success: false, error: innerErr });
					}
					return success({ success: true, transaction: result });
				});
			}
			return success({ success: true, transaction });
		});
	};

	this.getUnconfirmedTransaction = function (transactionId, error, success) {
		this.getTransaction(transactionId, error, success, '/api/transactions/unconfirmed/get?id=');
	};

	this.getUnconfirmedTransactions = function (transactions, error, success) {
		async.waterfall([
			cb => request.get({
				url: `${app.get('lisk address')}/api/transactions/unconfirmed`,
				json: true,
			}, (err, response, body) => {
				if (err || response.statusCode !== 200) {
					return error({ success: false, error: (err || 'Response was unsuccessful') });
				} else if (body.success === true && transactions) {
					body.transactions = concatenate(transactions, body);
					return cb(null, body.transactions);
				}
				return error({ success: false, error: body.error });
			}),
			processTransactions,
		], (err, result) => {
			if (err) {
				return error({ success: false, error: err });
			}
			return success({ success: true, transactions: result });
		});
	};

	this.getLastTransactions = function (query, error, success) {
		request.get({
			url: `${app.get('lisk address')}/api/transactions?orderBy=timestamp:desc&limit=20`,
			json: true,
		}, (err, response, body) => {
			if (err || response.statusCode !== 200) {
				return error({ success: false, error: (err || 'Response was unsuccessful') });
			} else if (body.success === true) {
				_.each(body.transactions, knowledge.inTx);
				return this.getUnconfirmedTransactions(body.transactions, error, success);
			}
			return error({ success: false, error: body.error });
		});
	};

	const normalizeTransactionParams = (params) => {
		if (!params || (!params.address && !params.senderId && !params.recipientId)) {
			return 'Missing/Invalid address parameter';
		}

		const directionQueries = [];
		const baseQuery = `orderBy=timestamp:desc&offset=${param(params.offset, 0)}&limit=${param(params.limit, 100)}`;
		const address = coreUtils.parseAddress(params.address);

		if (params.direction === 'sent') {
			directionQueries.push(`${baseQuery}&and:senderId=${address}&and:type=0`);
		} else if (params.direction === 'received') {
			directionQueries.push(`${baseQuery}&and:recipientId=${address}&and:type=0`);
		} else if (params.direction === 'others') {
			for (let i = 1; i < 8; i++) {
				directionQueries.push(`${baseQuery}&and:senderId=${address}&and:type=${i}`);
			}
		} else if (params.address) {
			directionQueries.push(`${baseQuery}&and:recipientId=${address}&or:senderId=${address}`);
		} else {
			// advanced search
			let advanced = '';
			Object.keys(params).forEach((key) => {
				if (!(/key|url|parent|orderBy|offset|limit|type|recipientId|query/.test(key))) {
					advanced += `&and:${key}=${params[key]}`;
				}
			});
			// type might be comma separate or undefined
			if (params.type) {
				params.type.split(',').forEach((type) => {
					if (type) {
						directionQueries.push(`${baseQuery}${advanced}&and:type=${type}`);
					}
				});
			} else {
				directionQueries.push(`${baseQuery}${advanced}`);
			}

			// If recipientId is the same as senderId, create an extra request for it.
			if (coreUtils.parseAddress(params.recipientId) === coreUtils.parseAddress(params.senderId)) {
				const reqs = directionQueries.length;
				for (let i = 0; i < reqs; i++) {
					directionQueries.push(directionQueries[i].replace('senderId', 'recipientId'));
				}
			} else if (params.recipientId && !params.senderId) {
				directionQueries.forEach((directionQuery, index) => {
					directionQueries[index] = `${directionQuery}&and:recipientId=${coreUtils.parseAddress(params.recipientId)}`;
				});
			}
		}

		return directionQueries;
	};

	this.getTransactionsByAddress = function (query, error, success) {
		const queryList = normalizeTransactionParams(query, error);
		if (typeof queryList === 'string') {
			return error({ success: false, error: queryList });
		}

		const queryCallsList = queryList.map(directionQuery => (callback) => {
			request.get({
				url: `${app.get('lisk address')}/api/transactions?${directionQuery}`,
				json: true,
			}, (err, response, body) => {
				if (err || response.statusCode !== 200) {
					callback(err || 'Response was unsuccessful');
				} else if (body && Array.isArray(body.transactions)) {
					callback(null, body.transactions);
				} else {
					callback(body.error || 'Response was unsuccessful');
				}
			});
		});

		return async.waterfall([
			function (cb) {
				async.parallel(
					queryCallsList,
					(err, results) => {
						if (err) {
							return error({ success: false, error: err });
						}
						return cb(null, _.uniq(_.flatten(results), 'id'));
					});
			},
			processTransactions,
		], (err, result) => {
			if (err) {
				return error({ success: false, error: err });
			}
			return success({ success: true, transactions: result });
		});
	};

	this.getTransactionsByBlock = function (query, error, success) {
		if (!query.blockId) {
			return error({ success: false, error: 'Missing/Invalid blockId parameter' });
		}

		return async.waterfall([
			function (cb) {
				request.get({
					url: `${app.get('lisk address')}/api/transactions?blockId=${query.blockId}&orderBy=timestamp:desc&offset=${param(query.offset, 0)}&limit=${param(query.limit, 100)}`,
					json: true,
				}, (err, response, body) => {
					if (err || response.statusCode !== 200) {
						return error({ success: false, error: (err || 'Response was unsuccessful') });
					} else if (body.success === true) {
						return cb(null, body.transactions);
					}
					return error({ success: false, error: body.error });
				});
			},
			processTransactions,
		], (err, result) => {
			if (err) {
				return error({ success: false, error: err });
			}
			return success({ success: true, transactions: result });
		});
	};
};
