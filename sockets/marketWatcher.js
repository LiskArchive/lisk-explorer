

const api = require('../lib/api');
const logger = require('../utils/logger');

module.exports = function (app, connectionHandler, socket) {
	let candles = new api.candles(app),
		connection = new connectionHandler('Market Watcher:', socket, this),
		interval = null,
		data = {};

	this.onInit = function () {
	};

	this.onConnect = function () {
	};

	this.onDisconnect = function () {
	};

	// Private

	const log = function (level, msg) {
		logger[level]('Market Watcher:', msg);
	};
};

