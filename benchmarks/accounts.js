const logger = require('../utils/logger');

module.exports = function (app, api) {
	const accounts = new api.accounts(app);

	this.getAccount = function (deferred) {
		accounts.getAccount(
			{ address: '12907382053545086321L' },
			(data) => {
				deferred.resolve();
				logger.error('accounts.getAccount ~>', 'Error retrieving account:', data.error);
			},
			() => {
				deferred.resolve();
				logger.info('accounts.getAccount ~>', 'account retrieved in', String(deferred.elapsed), 'seconds');
			},
		);
	};

	this.getTopAccounts = function (deferred) {
		accounts.getTopAccounts(
			{ offset: 0, limit: 50 },
			(data) => {
				deferred.resolve();
				logger.error('accounts.getTopAccounts ~>', 'Error retrieving accounts:', data.error);
			},
			(data) => {
				deferred.resolve();
				logger.info('accounts.getTopAccounts ~>', data.accounts.length, 'accounts retrieved in', String(deferred.elapsed), 'seconds');
			},
		);
	};
};

