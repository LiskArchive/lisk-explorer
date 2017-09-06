const handler = require('./handler');

module.exports = function (app, api) {
	const delegatesApi = new api.delegates(app);

	this.getActive = deferred =>
		handler(delegatesApi, 'getActive', undefined, deferred, 'delegates', data => data.delegates.length);

	this.getStandby = deferred =>
		handler(delegatesApi, 'getStandby', 0, deferred, 'delegates', data => data.delegates.length);

	this.getLatestRegistrations = deferred =>
		handler(delegatesApi, 'getLatestRegistrations', undefined, deferred, 'registrations', data => data.transactions.length);

	this.getLatestVotes = deferred =>
		handler(delegatesApi, 'getLatestVotes', undefined, deferred, 'votes', data => data.transactions.length);

	this.getLastBlock = deferred =>
		handler(delegatesApi, 'getLastBlock', undefined, deferred, 'block');
};

