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

const http = require('./http.js');

const validateCoreResponse = (body) => {
	try {
		if (typeof body === 'object' && body.success === true) {
			return true;
		}
		return false;
	} catch (err) {
		return false;
	}
};

const get = url => new Promise((resolve, reject) => {
	http.get(url).then((body) => {
		if (validateCoreResponse(body)) {
			return resolve(body);
		}
		return reject(body.error || 'Response was unsuccessful');
	}).catch((err) => {
		reject(err);
	});
});

const parseAddress = function (address) {
	if (typeof address !== 'string') return '';
	return address.replace('l', 'L');
};

module.exports = {
	get,
	parseAddress,
};
