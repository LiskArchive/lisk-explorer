const logger = require('../utils/logger');

module.exports = function (app, api) {
	const delegates = new api.delegates(app);

	this.getActive = (deferred) => {
		delegates.getActive(
			(data) => {
				deferred.resolve();
				logger.error('delegates.getActive ~>', 'Error retrieving delegates:', data.error);
			},
			(data) => {
				deferred.resolve();
				logger.info('delegates.getActive ~>', data.delegates.length, 'delegates retrieved in', String(deferred.elapsed), 'seconds');
			},
		);
	};

	this.getStandby = (deferred) => {
		delegates.getStandby(
			0,
			(data) => {
				deferred.resolve();
				logger.error('delegates.getStandby ~>', 'Error retrieving delegates:', data.error);
			},
			(data) => {
				deferred.resolve();
				logger.info('delegates.getStandby ~>', data.delegates.length, 'delegates retrieved in', String(deferred.elapsed), 'seconds');
			},
		);
	};

	this.getLatestRegistrations = (deferred) => {
		delegates.getLatestRegistrations(
			(data) => {
				deferred.resolve();
				logger.error('delegates.getLatestRegistrations ~>', 'Error retrieving registrations:', data.error);
			},
			(data) => {
				deferred.resolve();
				logger.info('delegates.getLatestRegistrations ~>', data.transactions.length, 'registrations retrieved in', String(deferred.elapsed), 'seconds');
			},
		);
	};

	this.getLatestVotes = (deferred) => {
		delegates.getLatestVotes(
			(data) => {
				deferred.resolve();
				logger.error('delegates.getLatestVotes ~>', 'Error retrieving votes:', data.error);
			},
			(data) => {
				deferred.resolve();
				logger.info('delegates.getLatestVotes ~>', data.transactions.length, 'votes retrieved in', String(deferred.elapsed), 'seconds');
			},
		);
	};

	this.getLastBlock = (deferred) => {
		delegates.getLastBlock(
			(data) => {
				deferred.resolve();
				logger.error('delegates.getLastBlock ~>', 'Error retrieving block:', data.error);
			},
			() => {
				deferred.resolve();
				logger.info('delegates.getLastBlock ~>', 'block retrieved in', String(deferred.elapsed), 'seconds');
			},
		);
	};
};

