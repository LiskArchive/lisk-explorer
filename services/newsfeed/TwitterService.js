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
const Twitter = require('twitter');

const SERVICE_NAME = 'twitter';

const client = new Twitter({
	consumer_key: process.env.TWITTER_CONSUMER_KEY,
	consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
	access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
	access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

const safeRef = (obj, path) => {
	try {
		// eslint-disable-next-line
		return path.split('.').reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, obj);
	} catch (e) {
		return null;
	}
};

const tweetUrl = (o) => {
	if (o.retweeted_status) {
		return safeRef(o, 'retweeted_status.entities.urls.0.url');
	} else if (o.extended_entities) {
		return safeRef(o, 'extended_entities.media.0.url');
	} else if (o.entities) {
		return safeRef(o, 'entities.urls.0.url');
	}
	return null;
};

const tweetTimestamp = (o) => {
	if (o.created_at) {
		const datetime = new Date(o.created_at);
		return datetime.getTime();
	}
	return null;
};

const tweetMapper = o => ({
	source: SERVICE_NAME,
	sourceId: o.id,
	timestamp: tweetTimestamp(o),
	content: o.text,
	url: tweetUrl(o),
});

function getData(request, data) {
	return new Promise((resolve, reject) => {
		client.get(request, data, (error, tweets, response) => {
			if (error) {
				return reject(error);
			}
			return resolve(tweets.map(tweetMapper), { response, tweets });
		});
	});
}

module.exports = {
	SERVICE_NAME,
	getData,
};
