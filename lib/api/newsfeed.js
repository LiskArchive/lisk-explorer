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
const { TwitterService } = require('../../services/newsfeed');


module.exports = function () {
	this.newsfeed = function (query, errorCb, successCb) {
		query.source = query.source || 'all';
		const sources = Array.isArray(query.source) ? query.source : [query.source];

		if (sources.includes('all') || sources.includes(TwitterService.SERVICE_NAME)) {
			const params = {
				screen_name: 'liskHQ',
				count: query.limit || 20,
			};

			return TwitterService
				.getData('statuses/user_timeline', params)
				.then(tweets => successCb(tweets), error => errorCb(error));
		}
		return errorCb('Invalid source param');
	};
};
