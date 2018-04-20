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

const HttpStatus = require('http-status-codes');

/**
 * @todo This should move to utilities
 *
 * @param {Object} api - Api constructor instance
 * @param {String} endpoint - The name of the endpoint on the Api object
 * @param {any} param - The parameter to be passed to endpoint. Can be of any interface
 * @param {Object} req - Default ExpressJS Api endpoint request object
 * @param {Object} res - Default ExpressJS Api endpoint response object
 * @param {Object} next - Default ExpressJS next hook
 *
 * @returns {Object} error or Api call value
 */
module.exports = (api, endpoint, param, req, res, next) => {
	if (!api || !api[endpoint]) {
		return new Error('The given endpoint is not defined in the given Api');
	}
	return api[endpoint].call(
		api,
		param,
		(data) => {
			if (data) {
				switch (data.status) {
				case 'SERVICE_UNAVAILABLE':
					res.status(HttpStatus.SERVICE_UNAVAILABLE);
					break;
				case 'INTERNAL_SERVER_ERROR':
					res.status(HttpStatus.SERVICE_UNAVAILABLE);
					break;
				default:
				}
			}
			res.json(data);
		},
		(data) => {
			req.json = data;
			return next();
		});
};
