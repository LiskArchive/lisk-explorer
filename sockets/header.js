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
const config = require('../config');
const async = require('async');
const logger = require('../utils/logger');
const SocketClient = require('../utils/socketClient');

module.exports = function (app, connectionHandler, socket) {
	const blocks = new api.blocks(app);
	const common = new api.common(app);
	const delegates = new api.delegates(app);
	const connection = new connectionHandler('Header:', socket, this);
	let intervals = [];
	let data = {};
	const tmpData = {};

	const socketClient = new SocketClient(app.get('lisk websocket address'));

	const running = {
		getBlockStatus: false,
		getPriceTicker: false,
	};

	const log = (level, msg) => {
		logger[level]('Header:', msg);
	};

	const getBlockStatus = (cb) => {
		if (running.getBlockStatus) {
			return cb('getBlockStatus (already running)');
		}
		running.getBlockStatus = true;
		return blocks.getBlockStatus(
			'preserved',
			() => { running.getBlockStatus = false; cb('Status'); },
			(res) => { running.getBlockStatus = false; cb(null, res); });
	};

	const getPriceTicker = (cb) => {
		if (running.getPriceTicker) {
			return cb('getPriceTicker (already running)');
		}
		running.getPriceTicker = true;
		return common.getPriceTicker(
			'preserved',
			() => { running.getPriceTicker = false; cb('PriceTicker'); },
			(res) => { running.getPriceTicker = false; cb(null, res); });
	};

	const emitData = () => {
		const thisData = {};

		async.parallel([
			getBlockStatus,
			getPriceTicker,
		],
		(err, res) => {
			if (err) {
				log('error', `Error retrieving: ${err}`);
			} else {
				thisData.status = res[0];
				thisData.ticker = res[1];

				data = thisData;
				log('debug', 'Emitting data');
				socket.emit('data', thisData);
			}
		});
	};

	this.onInit = function () {
		// Prevents data wipe
		this.onConnect();

		async.parallel([
			getBlockStatus,
			getPriceTicker,
		],
		(err, res) => {
			if (err) {
				log('error', `Error retrieving: ${err}`);
			} else {
				data.status = res[0];
				data.ticker = res[1];

				log('debug', 'Emitting new data');
				socket.emit('data', data);

				socketClient.socket.on('blocks/change', () => {
					emitData();
				});
			}
		});
	};

	this.onConnect = function () {
		log('debug', 'Emitting existing data');
		socket.emit('data', data);
	};

	this.onDisconnect = function () {
	};
};
