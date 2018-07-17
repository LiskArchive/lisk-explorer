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
module.exports = function (app, api) {
	this.nodeConstants = () => app.get('nodeConstants');
	this.version = () => ({ version: app.get('version') });

	const exchange = app.exchange;
	const addressReg = /^[0-9]{2,21}[L|l]$/;
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

	this.getPriceTicker = function (query, error, success) {
		if (app.get('exchange enabled')) {
			// If exchange rates are enabled - that endpoint cannot fail,
			// in worst case we return empty object here
			return success({ success: true, tickers: exchange.tickers });
		}
		// We use success callback here on purpose
		return success({ success: false, error: 'Exchange rates are disabled' });
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
