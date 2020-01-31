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
const async = require('async');

module.exports = function (app, api) {
	this.nodeConstants = () => app.get('nodeConstants');
	this.version = () => ({ version: app.get('version') });

	const exchange = app.exchange;
	const addressReg = /^[0-9]{1,21}[L|l]$/;
	const publicKeyReg = /^[0-9a-f]{64}$/;
	const usernameReg = /[a-z!@$&_.]/;

	const searchDelegates = function (id, error, success) {
		const delegates = new api.delegates(app);
		delegates.getSearch(
			id,
			body => error({ success: false, error: body.error }),
			(body) => {
				if (body && Array.isArray(body.results)) {
					return success({ success: true, result: { type: 'delegate', delegates: body.results } });
				}
				return error({ success: false, error: null, found: false });
			});
	};

	const searchAccount = function (id, error, success) {
		const accounts = new api.accounts(app);
		accounts.getAccount(
			{ address: id },
			body => error({ success: false, error: body.error }),
			(body) => {
				if (body && body.address) {
					return success({ success: true, result: { type: 'address', id: body.address } });
				}
				return error({ success: false, error: null, found: false });
			});
	};

	const searchPublicKey = function (id, error, success) {
		const accounts = new api.accounts(app);
		accounts.getAccount(
			{ publicKey: id },
			body => error({ success: false, error: body.error }),
			(body) => {
				if (body && body.address) {
					return success({ success: true, result: { type: 'address', id: body.address } });
				}
				return error({ success: false, error: null, found: false });
			});
	};

	const searchTransaction = function (id, error, success) {
		const transactions = new api.transactions(app);
		transactions.getTransaction(
			id,
			() => searchDelegates(id, error, success),
			(body) => {
				if (body && body.transaction) {
					return success({ success: true, result: { type: 'tx', id: body.transaction.id } });
				}
				return error({ success: false, error: body.error });
			});
	};

	const searchBlock = function (id, error, success) {
		const blocks = new api.blocks(app);
		blocks.getBlock(
			id,
			() => searchTransaction(id, error, success),
			(body) => {
				if (body && body.block) {
					return success({ success: true, result: { type: 'block', id: body.block.id } });
				}
				return error({ success: false, error: body.error });
			});
	};

	const searchHeight = function (id, error, success) {
		const blocks = new api.blocks(app);
		blocks.getHeight(
			id,
			() => searchBlock(id, error, success),
			(body) => {
				if (body && body.block) {
					return success({ success: true, result: { type: 'block', id: body.block.id } });
				}
				return error({ success: false, error: body.error });
			});
	};

	this.search = function (id, error, success) {
		if (id === null) {
			return error({ success: false, error: 'Missing/Invalid search criteria' });
		} else if (addressReg.test(id)) {
			return searchAccount(id, error, success);
		} else if (publicKeyReg.test(id)) {
			return searchPublicKey(id, error, success);
		} else if (usernameReg.test(id)) {
			return searchDelegates(id, error, success);
		}
		return searchHeight(id, error, success);
	};

	const newSearchDelegatesFullText = function (id, cb) {
		const delegates = new api.delegates(app);
		delegates.getSearch(
			id,
			body => cb(null, { success: false, error: body.error }),
			(body) => {
				if (body && Array.isArray(body.results)) {
					return cb(null, { success: true, result: { type: 'delegate', delegates: body.results } });
				}
				return cb(null, { success: false, error: null, found: false });
			});
	};

	const newSearchDelegatesStrict = function (id, cb) {
		const delegates = new api.delegates(app);
		delegates.getStrictSearch(
			id,
			body => cb(null, { success: false, error: body.error }),
			(body) => {
				if (body && Array.isArray(body.results)) {
					return cb(null, { success: true, result: { type: 'delegate', delegates: body.results } });
				}
				return cb(null, { success: false, error: null, found: false });
			});
	};

	const newSearchAccount = function (id, cb) {
		const accounts = new api.accounts(app);
		accounts.getAccount(
			{ address: id },
			body => cb(null, { success: false, error: body.error }),
			(body) => {
				if (body && body.address) {
					return cb(null, { success: true, result: { type: 'address', id: body.address } });
				}
				return cb(null, { success: false, error: null, found: false });
			});
	};

	const newSearchPublicKey = function (id, cb) {
		const accounts = new api.accounts(app);
		accounts.getAccount(
			{ publicKey: id },
			body => cb(null, { success: false, error: body.error }),
			(body) => {
				if (body && body.address) {
					return cb(null, { success: true, result: { type: 'address', id: body.address } });
				}
				return cb(null, { success: false, error: null, found: false });
			});
	};

	const newSearchTransaction = function (id, cb) {
		const transactions = new api.transactions(app);
		transactions.getTransaction(
			id,
			body => cb(null, { success: false, error: body.error }),
			(body) => {
				if (body && body.transaction) {
					return cb(null, { success: true, result: { type: 'tx', id: body.transaction.id } });
				}
				return cb(null, { success: false, error: body.error });
			});
	};

	const newSearchBlock = function (id, cb) {
		const blocks = new api.blocks(app);
		blocks.getBlock(
			id,
			body => cb(null, { success: false, error: body.error }),
			(body) => {
				if (body && body.block) {
					return cb(null, { success: true, result: { type: 'block', id: body.block.id, height: body.block.height } });
				}
				return cb(null, { success: false, error: body.error });
			});
	};

	const newSearchHeight = function (id, cb) {
		const blocks = new api.blocks(app);
		blocks.getHeight(
			id,
			body => cb(null, { success: false, error: body.error }),
			(body) => {
				if (body && body.block) {
					return cb(null, { success: true, result: { type: 'block', id: body.block.id, height: body.block.height } });
				}
				return cb(null, { success: false, error: body.error });
			});
	};

	const removeDuplicates = (origArr) => {
		const newObj = {};
		origArr.forEach((item) => {
			newObj[`${item.type}${item.id}`] = item;
		});
		return Object.keys(newObj).map(item => newObj[item]);
	};

	this.unifiedSearch = function (query, error, success) {
		if (query === null) {
			return error({ success: false, error: 'Missing/Invalid search criteria' });
		}

		return async.parallel([
			async.apply(newSearchAccount, query),
			async.apply(newSearchPublicKey, query),
			async.apply(newSearchDelegatesFullText, query),
			async.apply(newSearchDelegatesStrict, query),
			async.apply(newSearchHeight, query),
			async.apply(newSearchTransaction, query),
			async.apply(newSearchBlock, query),
		], (err, results) => {
			const searchResults = [];
			Object.keys(results).forEach((i) => {
				const group = results[i];
				if (group.success === true) {
					if (group.result.type === 'delegate') {
						group.result.delegates.forEach((item) => {
							searchResults.push({
								id: item.address,
								description: item.username,
								type: 'address',
								accuracy: item.similarity,
							});
						});
					} else if (group.result.type === 'address' || group.result.type === 'block' || group.result.type === 'tx') {
						searchResults.push({
							id: group.result.id,
							type: group.result.type,
							description: group.result.height,
							accuracy: 1,
						});
					}
				}
			});
			const searchResultsWoDupes = removeDuplicates(searchResults);
			searchResultsWoDupes.sort((a, b) => b.accuracy - a.accuracy);
			success({ success: true, result: searchResultsWoDupes });
		});
	};

	this.getPriceTicker = function (query, error, success) {
		if (app.get('exchange enabled')) {
			// If exchange rates are enabled - that endpoint cannot fail,
			// in worst case we return empty object here
			return success({ success: true, tickers: exchange.tickers });
		}
		// We use success callback here on purpose
		return success({ success: false, error: 'Exchange rates are disabled' });
	};

	this.ui_message = function (query, error, success) {
		const msg = app.get('uiMessage');
		const now = new Date();

		if (msg && msg.text) {
			const start = msg.start ? new Date(msg.start) : null;
			const end = msg.end ? new Date(msg.end) : null;
			if ((!start || (now >= start)) && (!end || (now < end))) {
				return success({ success: true, content: msg.text });
			}
		}
		return success({ success: false, error: 'There is no info message to send' });
	};
};
