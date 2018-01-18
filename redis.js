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
const redis = require('redis');
const logger = require('./utils/logger');

module.exports = function (config) {
	const client = redis.createClient(
		config.redis.port,
		config.redis.host,
		{ db: config.redis.db });

	if (config.redis.password) {
		client.auth(config.redis.password, (err) => {
			if (err) {
				logger.error(`Can't connect to redis: ${err}`);
			}
		});
	}

	return client;
};
