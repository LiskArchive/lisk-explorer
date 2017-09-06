const handler = require('./handler');

module.exports = function (app, api) {
	const accountsApi = new api.accounts(app);

	this.getAccount = deferred =>
		handler(accountsApi, 'getAccount', { address: '12907382053545086321L' }, deferred, 'accounts');

	this.getTopAccounts = deferred =>
		handler(accountsApi, 'getTopAccounts', { offset: 0, limit: 50 }, deferred, 'accounts', data => data.accounts.length);
};
