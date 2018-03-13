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
const api = require('../lib/api');
// const logger = require('../utils/logger');

module.exports = function (app, connectionHandler, socket) {
	const holder = {};
	holder.candles = new api.candles(app);
	holder.connection = new connectionHandler('Market Watcher:', socket, this);
	// let interval = null;
	// let data = {};

	// const log = function (level, msg) {
	// 	logger[level]('Market Watcher:', msg);
	// };

	this.onInit = function () {
	};

	this.onConnect = function () {
	};

	this.onDisconnect = function () {
	};
};

