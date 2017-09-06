const logger = require('../utils/logger');

/**
 * @todo This should move to utilities
 *
 * @param {Object} api - Api constructor instance
 * @param {String} endpoint - The name of the endpoint on the Api object
 * @param {any} param - The parameter to be passed to endpoint. Can be of any interface
 * @param {Object} deferred
 * @param {String} type - The name of interface used for logging
 * @param {Function} getExtraData - A function accepting data and
 * 	returning extra data required for logging
 *
 * @returns {Object} error or Api call value
 */
module.exports = (api, endpoint, param, deferred, type, getExtraData) =>
	api[endpoint].call(
		api,
		param,
		({ error }) => {
			deferred.resolve();
			logger.error(`${type}.${endpoint} ~>`, `Error retrieving ${type}: ${error}`);
		},
		(data) => {
			deferred.resolve();
			const extraData = getExtraData ? getExtraData(data) : '';
			logger.info(`${type}.${endpoint} ~>`, `${extraData} ${type} retrieved in ${String(deferred.elapsed)} seconds`);
		});
