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
