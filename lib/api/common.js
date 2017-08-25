

const request = require('request');

module.exports = function (app, api) {
	this.version = function () {
		return { version: app.get('version') };
	};
	const exchange = app.exchange;

	this.getPriceTicker = function (error, success) {
		if (app.get('exchange enabled')) {
			// If exchange rates are enabled - that endpoint cannot fail, in worst case we return empty object here
			return success({ success: true, tickers: exchange.tickers });
		}
		// We use success callback here on purpose
		return success({ success: false, error: 'Exchange rates are disabled' });
	};

	this.search = function (id, error, success) {
		if (id === null) {
			return error({ success: false, error: 'Missing/Invalid search criteria' });
		}
		searchHeight(id, error, success);
	};

	// Private

	var searchHeight = function (id, error, success) {
		new api.blocks(app).getHeight(
			id,
			body => searchBlock(id, error, success),
			(body) => {
				if (body.success === true) {
					return success({ success: true, type: 'block', id: body.block.id });
				}
				return error({ success: false, error: body.error });
			});
	};


	var searchBlock = function (id, error, success) {
		new api.blocks(app).getBlock(
			id,
			body => searchTransaction(id, error, success),
			(body) => {
				if (body.success === true) {
					return success({ success: true, type: 'block', id: body.block.id });
				}
				return error({ success: false, error: body.error });
			});
	};

	var searchTransaction = function (id, error, success) {
		new api.transactions(app).getTransaction(
			id,
			body => searchPublicKey(id, error, success),
			(body) => {
				if (body.success === true) {
					return success({ success: true, type: 'tx', id: body.transaction.id });
				}
				return error({ success: false, error: body.error });
			});
	};

	const searchAccount = function (id, error, success) {
		new api.accounts(app).getAccount(
			{ address: id },
			body => searchDelegates(id, error, success),
			(body) => {
				if (body.success === true) {
					return success({ success: true, type: 'address', id });
				}
				return error({ success: false, error: null, found: false });
			});
	};

	var searchPublicKey = function (id, error, success) {
		new api.accounts(app).getAccount(
			{ publicKey: id },
			body => searchAccount(id, error, success),
			(body) => {
				if (body.success === true) {
					return success({ success: true, type: 'address', id: body.address });
				}
				return error({ success: false, error: null, found: false });
			});
	};

	var searchDelegates = function (id, error, success) {
		new api.delegates(app).getSearch(
			id,
			body => error({ success: false, error: body.error }),
			(body) => {
				if (body.success === true) {
					return success({ success: true, type: 'address', id: body.address });
				}
				return error({ success: false, error: null, found: false });
			});
	};
};
