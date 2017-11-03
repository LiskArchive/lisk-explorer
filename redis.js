

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
