const logger = require('../utils/logger');

module.exports = function (app, api) {
	const common = new api.common(app, api);

	this.getPriceTicker = (deferred) => {
		common.getPriceTicker(
			(data) => {
				deferred.resolve();
				logger.error('common.getPriceTicker ~>', 'Error retrieving price ticker:', data.error);
			},
			() => {
				deferred.resolve();
				logger.info('common.getPriceTicker ~>', 'price ticker retrieved in', String(deferred.elapsed), 'seconds');
			},
		);
	};

	this.search = (deferred) => {
		common.search(
			'12907382053545086321C',
			(data) => {
				deferred.resolve();
				logger.error('common.search ~>', 'Error retrieving search result:', data.error);
			},
			() => {
				deferred.resolve();
				logger.info('common.search ~>', 'search result retrieved in', String(deferred.elapsed), 'seconds');
			},
		);
	};
};
