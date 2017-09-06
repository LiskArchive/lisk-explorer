const handler = require('./handler');

module.exports = function (app, api) {
	const commonApi = new api.common(app, api);

	this.getPriceTicker = deferred =>
		handler(commonApi, 'getPriceTicker', undefined, deferred, 'price ticker');

	this.search = deferred =>
		handler(commonApi, 'search', '12907382053545086321C', deferred, 'price ticker');
};
