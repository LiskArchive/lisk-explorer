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

	const transactionMapping = function (o) {
		return {
			amount: o.amount,
			asset: o.asset,
			blockId: o.blockId,
			confirmations: o.confirmations,
			fee: o.fee,
			height: o.height,
			id: o.id,
			knownRecipient: o.knownRecipient,
			knownSender: o.knownSender,
			multisignatures: o.multisignatures || [],
			recipientId: o.recipientId,
			recipientPublicKey: o.recipientPublicKey,
			senderId: o.senderId,
			senderPublicKey: o.senderPublicKey,
			signature: o.signature,
			signatures: [o.signature],
			timestamp: o.timestamp,
			type: o.type,
			votes: o.votes,
		};
	};

	const transactionMapping2 = function (o) {
		return {
			amount: o.amount,
			asset: o.asset,
			blockId: o.blockId,
			confirmations: o.confirmations,
			fee: o.fee,
			height: o.height,
			id: o.id,
			knownRecipient: o.knownRecipient,
			knownSender: o.knownSender,
			recipientDelegate: o.recipientDelegate,
			recipientId: o.recipientId,
			recipientPublicKey: o.recipientPublicKey,
			senderDelegate: o.senderDelegate,
			senderId: o.senderId,
			senderPublicKey: o.senderPublicKey,
			signature: o.signature,
			signatures: [o.signature],
			timestamp: o.timestamp,
			type: o.type,
		};
	};

	const concatenate = function (transactions, newTransactions) {
		if (!Array.isArray(transactions)) transactions = [];
		transactions = newTransactions ? transactions.concat(newTransactions) : transactions;
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

		const found = getDelegateFromCache(transaction.senderId, tmpDelegateCache);
		if (found !== undefined) {
			transaction.senderDelegate = found;
			return cb(null, transaction);
		}

		return request.get({
			url: `${app.get('lisk address')}/delegates?publicKey=${transaction.senderPublicKey}`,
			json: true,
		}, (err, response, body) => {
			if (err || response.statusCode !== 200) {
				transaction.senderDelegate = null;
				return cb(null, transaction);
			} else if (body && Array.isArray(body.data) && body.data.length > 0) {
				transaction.senderDelegate = body.data[0];
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
			url: `${app.get('lisk address')}/accounts?address=${transaction.recipientId}`,
			json: true,
		}, (err, response, body) => {
			if (err || response.statusCode !== 200) {
				transaction.recipientPublicKey = null;
				return cb(null, transaction);
			} else if (body && Array.isArray(body.data) && body.data.length > 0) {
				transaction.recipientPublicKey = body.data[0].publicKey;
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
			url: `${app.get('lisk address')}/delegates?publicKey=${transaction.recipientPublicKey}`,
			json: true,
		}, (err, response, body) => {
			if (err || response.statusCode !== 200) {
				transaction.recipientDelegate = null;
				return cb(null, transaction);
			} else if (body && Array.isArray(body.data) && body.data.length > 0) {
				transaction.recipientDelegate = body.data[0];
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
				url: `${app.get('lisk address')}/delegates?publicKey=${forger.publicKey}`,
				json: true,
			}, (err, response, body) => {
				if (err || response.statusCode !== 200) {
					return cb(err || 'Response was unsuccessful');
				} else if (body && Array.isArray(body.data)) {
					forger.delegate = body.data[0];
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
			url = '/transactions?id=';
		}
		if (!transactionId) {
			return error({ success: false, error: 'Missing/Invalid transactionId parameter' });
		}


		const getInitialData = (waterCb) => {
			request.get({
				url: app.get('lisk address') + url + transactionId,
				json: true,
			}, (err, response, body) => {
				if (err || response.statusCode !== 200) {
					return error({ success: false, error: (err || 'Response was unsuccessful') });
				} else if (body && Array.isArray(body.data) && body.data.length > 0) {
					return waterCb(null, transactionMapping(body.data[0]));
				} else if (confirmed) {
					return self.getUnconfirmedTransaction(transactionId, error, success);
				}
				return error({ success: false, error: body.error });
			});
		};

		const prepareListsAndGetDelegates = (err, transaction) => {
			if (err) {
				return error({ success: false, error: err });
			}

			const t = new Transaction();

			if (transaction && transaction.asset && transaction.asset.votes) {
				const votes = transaction.asset.votes;

				if (votes.length) {
					const keyList = [];
					_.each(votes, (vote) => {
						if (typeof vote === 'string') {
							const attr = vote.split('', 1)[0];
							const publicKey = vote.replace(/[-+]/, '');
							keyList.push({ attr, publicKey });
						}
					});

					const splitOnTwoLists = (innerErr) => {
						if (innerErr) return error({ success: false, error: innerErr });
						transaction.votes = { added: [], deleted: [] };
						// eslint-disable-next-line guard-for-in,no-restricted-syntax
						for (const result of keyList) {
							const finalResult = { publicKey: result.publicKey, delegate: result.delegate };
							if (result.attr === '+') transaction.votes.added.push(finalResult);
							else if (result.attr === '-') transaction.votes.deleted.push(finalResult);
						}
						if (transaction.votes.added.length === 0) transaction.votes.added = null;
						if (transaction.votes.deleted.length === 0) transaction.votes.deleted = null;
						return success({ success: true, transaction: transactionMapping(transaction) });
					};

					return async.forEach(keyList, (item, callback) => {
						t.getDelegate(item, callback);
					}, splitOnTwoLists);
				}
				transaction.votes = { added: null, deleted: null };
				return success({ success: true, transaction: transactionMapping(transaction) });
			}
			return success({ success: true, transaction: transactionMapping(transaction) });
		};

		return async.waterfall([
			getInitialData,
			processTransaction,
		], prepareListsAndGetDelegates);
	};

	this.getUnconfirmedTransaction = function (transactionId, error, success) {
		this.getTransaction(transactionId, error, success, '/node/transactions/unconfirmed?id=');
	};

	this.getUnconfirmedTransactions = function (transactions, error, success) {
		async.waterfall([
			cb => request.get({
				url: `${app.get('lisk address')}/node/transactions/unconfirmed`,
				json: true,
			}, (err, response, body) => {
				if (err || response.statusCode !== 200) {
					return error({ success: false, error: (err || 'Response was unsuccessful') });
				} else if (body && Array.isArray(body.data)) {
					body.transactions = concatenate(transactions, body.data);
					return cb(null, body.transactions);
				}
				return error({ success: false, error: body.error });
			}),
			processTransactions,
		], (err, result) => {
			if (err) {
				return error({ success: false, error: err });
			}
			return success({ success: true, transactions: result.map(transactionMapping2) });
		});
	};

	this.getLastTransactions = function (query, error, success) {
		request.get({
			url: `${app.get('lisk address')}/transactions?sort=timestamp:desc&limit=20`,
			json: true,
		}, (err, response, body) => {
			if (err || response.statusCode !== 200) {
				return error({ success: false, error: (err || 'Response was unsuccessful') });
			} else if (body && Array.isArray(body.data)) {
				const result = body.data.map(transactionMapping);
				_.each(result, knowledge.inTx);
				return this.getUnconfirmedTransactions(result, error, success);
			}
			return error({ success: false, error: body.error });
		});
	};

	const normalizeTransactionParams = (params) => {
		if (!params || (!params.address && !params.senderId && !params.recipientId)) {
			return 'Missing/Invalid address parameter';
		}

		const directionQueries = [];
		const baseQuery = `sort=timestamp:desc&offset=${param(params.offset, 0)}&limit=${param(params.limit, 100)}`;

		if (params.direction === 'sent') {
			directionQueries.push(`${baseQuery}&senderId=${params.address}&type=0`);
		} else if (params.direction === 'received') {
			directionQueries.push(`${baseQuery}&recipientId=${params.address}&type=0`);
		} else if (params.direction === 'others') {
			for (let i = 1; i < 8; i++) {
				directionQueries.push(`${baseQuery}&senderId=${params.address}&type=${i}`);
			}
		} else if (params.address) {
			directionQueries.push(`${baseQuery}&senderIdOrRecipientId=${params.address}`);
		} else {
			// advanced search
			let advanced = '';
			Object.keys(params).forEach((key) => {
				if (!(/key|url|parent|sort|offset|limit|type|recipientId|query/.test(key))) {
					advanced += `&and:${key}=${params[key]}`;
				}
			});

			// type might be comma separate or undefined
			if (params.type) {
				params.type.split(',').forEach((type) => {
					if (type) {
						directionQueries.push(`${baseQuery}${advanced}&type=${type}`);
					}
				});
			} else {
				directionQueries.push(`${baseQuery}${advanced}`);
			}

			// If recipientId is the same as senderId, create an extra request for it.
			if (params.recipientId === params.senderId) {
				const reqs = directionQueries.length;
				for (let i = 0; i < reqs; i++) {
					directionQueries.push(directionQueries[i].replace('senderId', 'recipientId'));
				}
			} else if (params.recipientId && !params.senderId) {
				directionQueries.forEach((directionQuery, index) => {
					directionQueries[index] = `${directionQuery}&recipientId=${params.recipientId}`;
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
				url: `${app.get('lisk address')}/transactions?${directionQuery}`,
				json: true,
			}, (err, response, body) => {
				if (err || response.statusCode !== 200) {
					callback(err || 'Response was unsuccessful');
				} else if (body && Array.isArray(body.data)) {
					callback(null, body.data);
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
			return success({ success: true, transactions: result.map(transactionMapping2) });
		});
	};

	this.getTransactionsByBlock = function (query, error, success) {
		if (!query.blockId) {
			return error({ success: false, error: 'Missing/Invalid blockId parameter' });
		}

		return async.waterfall([
			function (cb) {
				request.get({
					url: `${app.get('lisk address')}/transactions?blockId=${query.blockId}&sort=timestamp:desc&offset=${param(query.offset, 0)}&limit=${param(query.limit, 100)}`,
					json: true,
				}, (err, response, body) => {
					if (err || response.statusCode !== 200) {
						return error({ success: false, error: (err || 'Response was unsuccessful') });
					} else if (body && Array.isArray(body.data)) {
						return cb(null, body.data);
					}
					return error({ success: false, error: body.error });
				});
			},
			processTransactions,
		], (err, result) => {
			if (err) {
				return error({ success: false, error: err });
			}
			return success({ success: true, transactions: result.map(transactionMapping2) });
		});
	};
};
