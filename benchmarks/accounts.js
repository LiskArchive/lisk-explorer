

module.exports = function (app, api) {
	const accounts = new api.accounts(app);

	this.getAccount = function (deferred) {
		accounts.getAccount(
			{ address: '12907382053545086321L' },
			(data) => {
				deferred.resolve();
				console.log('accounts.getAccount ~>', 'Error retrieving account:', data.error);
			},
			(data) => {
				deferred.resolve();
				console.log('accounts.getAccount ~>', 'account retrieved in', String(deferred.elapsed), 'seconds');
			},
		);
	};

	this.getTopAccounts = function (deferred) {
		accounts.getTopAccounts(
			{ offset: 0, limit: 50 },
			(data) => {
				deferred.resolve();
				console.log('accounts.getTopAccounts ~>', 'Error retrieving accounts:', data.error);
			},
			(data) => {
				deferred.resolve();
				console.log('accounts.getTopAccounts ~>', data.accounts.length, 'accounts retrieved in', String(deferred.elapsed), 'seconds');
			},
		);
	};
};

