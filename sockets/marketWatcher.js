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

