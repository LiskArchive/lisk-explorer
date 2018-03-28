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
const async = require('async');
const logger = require('../utils/logger');

module.exports = function (app, connectionHandler, socket) {
	const statistics = new api.statistics(app);
	const connection = new connectionHandler('Network Monitor:', socket, this);
	let intervals = [];
	const data = {};

	const running = {
		getlastBlock: false,
		getBlocks: false,
		getPeers: false,
	};

	const log = (level, msg) => {
		logger[level]('Network Monitor:', msg);
	};

	const newInterval = (i, delay, cb) => {
		if (intervals[i] !== undefined) {
			return null;
		}
		intervals[i] = setInterval(cb, delay);
		return intervals[i];
	};

	const getLastBlock = (cb) => {
		if (running.getLastBlock) {
			return cb('getLastBlock (already running)');
		}
		running.getLastBlock = true;
		return statistics.getLastBlock(
			'preserved',
			() => {
				running.getLastBlock = false;
				cb('LastBlock');
			},
			(res) => {
				running.getLastBlock = false;
				cb(null, res);
			});
	};

	const getBlocks = (cb) => {
		if (running.getBlocks) {
			return cb('getBlocks (already running)');
		}
		running.getBlocks = true;
		return statistics.getBlocks(
			'preserved',
			() => {
				running.getBlocks = false;
				cb('Blocks');
			},
			(res) => {
				running.getBlocks = false;
				cb(null, res);
			});
	};

	const getPeers = (cb) => {
		if (running.getPeers) {
			return cb('getPeers (already running)');
		}
		running.getPeers = true;
		return statistics.getPeers(
			'preserved',
			() => {
				running.getPeers = false;
				cb('Peers');
			},
			(res) => {
				logger.debug(`Returned ${res.list.connected.length} connected peers.`);
				running.getPeers = false;
				cb(null, res);
			});
	};

	const emitData1 = () => {
		const lastBlockData = {};

		async.parallel([
			getLastBlock,
		],
		(err, res) => {
			if (err) {
				log('error', `Error retrieving: ${err}`);
			} else {
				lastBlockData.lastBlock = res[0];
				data.lastBlock = res[0];

				log('info', 'Emitting data-1 (last block data)');
				socket.emit('data1', lastBlockData);
			}
		});
	};

	const emitData2 = () => {
		const blocksData = {};

		async.parallel([
			getBlocks,
		],
		(err, res) => {
			if (err) {
				log('error', `Error retrieving: ${err}`);
			} else {
				blocksData.blocks = res[0];
				data.blocks = res[0];

				log('info', 'Emitting data-2 (blocks data)');
				socket.emit('data2', blocksData);
			}
		});
	};

	const emitData3 = () => {
		const peersData = {};

		async.parallel([
			getPeers,
		],
		(err, res) => {
			if (err) {
				log('error', `Error retrieving: ${err}`);
			} else {
				peersData.peers = res[0];
				data.peers = res[0];

				log('info', 'Emitting data-3 (peers data)');
				socket.emit('data3', peersData);
			}
		});
	};

	this.onInit = function () {
		this.onConnect();

		async.parallel([
			getLastBlock,
			getBlocks,
			getPeers,
		],
		(err, res) => {
			if (err) {
				log('error', `Error retrieving: ${err}`);
			} else {
				data.lastBlock = res[0];
				data.blocks = res[1];
				data.peers = res[2];

				log('info', 'Emitting new data');
				socket.emit('data', data);

				newInterval(0, 5000, emitData1);
				/** @todo Here we are pulling 8640 blocks - logic should be changed */
				newInterval(1, 300000, emitData2);
				newInterval(2, 5000, emitData3);
			}
		});
	};

	this.onConnect = function () {
		log('info', 'Emitting existing data');
		socket.emit('data', data);
	};

	this.onDisconnect = function () {
		for (let i = 0; i < intervals.length; i++) {
			clearInterval(intervals[i]);
		}
		intervals = [];
	};
};

