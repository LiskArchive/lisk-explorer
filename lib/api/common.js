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
	// const addressReg = /^[0-9]{1,21}[L|l]$/;
	// const publicKeyReg = /^[0-9a-f]{64}$/;
	// const usernameReg = /[a-z!@$&_.]/;

	const searchDelegatesFullText = function (id, cb) {
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

	const searchDelegatesStrict = function (id, cb) {
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

	const searchAccount = function (id, cb) {
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

	const searchPublicKey = function (id, cb) {
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

	const searchTransaction = function (id, cb) {
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

	const searchBlock = function (id, cb) {
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

	const searchHeight = function (id, cb) {
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

	this.getPriceTicker = function (query, error, success) {
		if (app.get('exchange enabled')) {
			// If exchange rates are enabled - that endpoint cannot fail,
			// in worst case we return empty object here
			return success({ success: true, tickers: exchange.tickers });
		}
		// We use success callback here on purpose
		return success({ success: false, error: 'Exchange rates are disabled' });
	};

	this.search = function (query, error, success) {
		if (query === null) {
			return error({ success: false, error: 'Missing/Invalid search criteria' });
		}

		return async.parallel([
			async.apply(searchAccount, query),
			async.apply(searchPublicKey, query),
			async.apply(searchDelegatesFullText, query),
			// async.apply(searchDelegatesStrict, query),
			async.apply(searchHeight, query),
			async.apply(searchTransaction, query),
			async.apply(searchBlock, query),
		], (err, results) => {
			const searchResults = [];
			Object.keys(results).forEach((i) => {
				const group = results[i];
				if (group.success === true) {
					if (group.result.type === 'delegate') {
						group.result.delegates.forEach((item) => {
							searchResults.push({
								name: item.username,
								address: item.address,
								type: group.result.type,
								accuracy: item.similarity,
							});
						});
					} else if (group.result.type === 'address' || group.result.type === 'block' || group.result.type === 'tx') {
						searchResults.push({
							name: group.result.id,
							type: group.result.type,
							height: group.result.height,
							accuracy: 1,
						});
					}
				}
			});
			// searchResults.sort();
			success({ success: true, result: searchResults });
		});
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
