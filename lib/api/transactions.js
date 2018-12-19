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
const coreUtils = require('../../utils/core.js');

module.exports = function (app) {
	const self = this;
	const knowledge = app.knownAddresses;
	const invalidAddress = '__invalid_address';

	const param = (p, d) => {
		p = parseInt(p, 10);

		if (isNaN(p) || p < 0) {
			return d;
		}
		return p;
	};

	const transactionMapping = function (o) {
		return {
			amount: Number(o.amount),
			asset: o.asset,
			blockId: o.blockId,
			confirmations: o.confirmations,
			fee: Number(o.fee),
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
			amount: Number(o.amount),
			asset: o.asset,
			blockId: o.blockId,
			confirmations: o.confirmations,
			fee: Number(o.fee),
			height: o.height,
			id: o.id,
			knownRecipient: o.knownRecipient,
			knownSender: o.knownSender,
			recipientId: o.recipientId,
			recipientPublicKey: o.recipientPublicKey,
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

	const getKnownSender = function (transaction, cb) {
		knowledge.getKnownAddress(transaction.senderId, (err, data) => {
			transaction.knownSender = data;
			cb(null, transaction);
		});
	};

	const getKnownRecipient = function (transaction, cb) {
		knowledge.getKnownAddress(transaction.recipientId, (err, data) => {
			transaction.knownRecipient = data;
			cb(null, transaction);
		});
	};

	const processTransaction = function (tx, cb) {
		async.waterfall([
			function (waterCb) {
				getKnownSender(tx, waterCb);
			},
			getKnownRecipient,
		], (err, result) => cb(null, result));
	};

	const processTransactions = function (transactions, cb) {
		async.eachSeries(transactions, (tx, seriesCb) => {
			processTransaction(tx, seriesCb);
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
				return this.getUnconfirmedTransactions(result, error, success);
			}
			return error({ success: false, error: body.error });
		});
	};

	const parseLiskAddress = async (address) => {
		const liskIdPattern = /^[0-9]{1,21}[L|l]$/g;

		if (!address || typeof address !== 'string') return '';
		if (address.match(liskIdPattern)) return coreUtils.parseAddress(address);
		address = await knowledge.getByUser(address);
		if (typeof address === 'object' && typeof address.address === 'string') return address.address;
		return invalidAddress;
	};

	const normalizeTransactionParams = async (params) => {
		const directionQueries = [];

		const offset = param(params.offset, 0);
		const limit = param(params.limit, 100);
		const sort = params.sort || 'timestamp:desc';

		const address = await parseLiskAddress(params.address);
		params.senderId = await parseLiskAddress(params.senderId);
		params.recipientId = await parseLiskAddress(params.recipientId);

		let baseQuery = `sort=${sort}&offset=${offset}&limit=${limit}`;

		if (address) {
			if (params.direction === 'sent') {
				directionQueries.push(`${baseQuery}&senderId=${address}&type=0`);
			} else if (params.direction === 'received') {
				directionQueries.push(`${baseQuery}&recipientId=${address}&type=0`);
			} else if (params.direction === 'others') {
				for (let i = 1; i < 8; i++) {
					directionQueries.push(`${baseQuery}&senderId=${address}&type=${i}`);
				}
			} else {
				directionQueries.push(`${baseQuery}&senderIdOrRecipientId=${address}`);
			}
		} else {
			// advanced search
			let filters = ['recipientId', 'recipientPublicKey', 'senderId', 'senderPublicKey', 'height', 'minAmount', 'maxAmount', 'fromTimestamp', 'toTimestamp', 'blockId'];

			// If recipientId is the same as senderId, use senderIdOrRecipientId instead.
			if (params.senderId && params.recipientId && params.senderId === params.recipientId) {
				baseQuery += `&senderIdOrRecipientId=${params.recipientId}`;
				filters = filters.filter(item => item !== 'senderId' && item !== 'recipientId');
			}

			Object.keys(params)
				.filter(p => !!params[p])
				.forEach((key) => {
					if ((filters.indexOf(key) >= 0)) {
						baseQuery += `&${key}=${params[key]}`;
					}
				});

			// type might be comma separate or undefined
			if (params.type) {
				params.type.split(',').forEach(type => directionQueries.push(`${baseQuery}&type=${type}`));
			} else {
				directionQueries.push(`${baseQuery}`);
			}
		}

		return directionQueries;
	};

	this.getTransactionsCall = function (queryList, error, success) {
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

	this.getTransactions = async function (query, error, success) {
		const queryList = await normalizeTransactionParams(query);
		this.getTransactionsCall(queryList, error, success);
	};

	this.getTransactionsByAddress = async function (query, error, success) {
		if (!query || (!query.address && !query.senderId && !query.recipientId)) {
			return error({ success: false, error: 'Missing/Invalid address parameter' });
		}
		const queryList = await normalizeTransactionParams(query);
		return this.getTransactionsCall(queryList, error, success);
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
