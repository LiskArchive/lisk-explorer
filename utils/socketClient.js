/*
 * LiskHQ/lisk-explorer
 * Copyright © 2019 Lisk Foundation
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
const io = require('socket.io-client');
const logger = require('./logger');
const util = require('util');

class SocketClient {
	constructor(path) {
		this.socket = io.connect(path, {
			transports: ['websocket'],
		});

		this.socket.on('connect', () => {
			logger.info(`${path}: SocketClient is connected`);
		});

		this.socket.on('connect_error', (error) => {
			logger.warn(`${path}: Connection error ${error.message}`);
		});

		this.socket.on('connect_timeout', (timeout) => {
			logger.warn(`${path}: Connection timeout: ${timeout}`);
		});

		this.socket.on('error', (error) => {
			logger.error(`${path}: Error: \n${util.inspect(error)}`);
		});

		this.socket.on('disconnect', (reason) => {
			logger.info(`${path}: Disconnected: ${reason}`);
		});

		this.socket.on('reconnect', () => {
			logger.info(`${path}: Reconnection`);
		});

		this.socket.on('reconnecting', () => {
			logger.info(`${path}: Reconnecting`);
		});

		this.socket.on('reconnect_error', (error) => {
			logger.warn(`${path}: Reconnection error: ${error.message}`);
		});

		this.socket.on('reconnect_failed', () => {
			logger.error(`${path}: Reconnection failed`);
		});

		this.socket.on('ping', () => {
			logger.trace(`${path}: Ping`);
		});

		this.socket.on('pong', () => {
			logger.trace(`${path}: Pong`);
		});
	}

	emit(arg1, arg2) {
		this.socket.emit(arg1, arg2, (res) => {
			logger.info(res);
		});
	}
}

module.exports = SocketClient;
