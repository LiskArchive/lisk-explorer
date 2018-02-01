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
const logger = require('../utils/logger');

module.exports = function (app, connectionHandler, socket) {
	const statistics = new api.statistics(app);
	const transactions = new api.transactions(app);
	const connection = new connectionHandler('Activity Graph:', socket, this);
	const running = { getlastBlock: false };
	let interval = null;
	let data = {};

	const log = function (level, msg) {
		logger[level]('Activity Graph:', msg);
	};

	const getBlockTransactions = function (resBlock, cb) {
		transactions.getTransactionsByBlock(
			{ blockId: resBlock.block.id,
				offset: 0,
				limit: 100 },
			() => {
				running.getLastBlock = false;
				cb('BlockTransactions');
			},
			(res) => {
				if (res.success) {
					resBlock.block.transactions = res.transactions;
				} else {
					resBlock.block.transactions = [];
				}
				running.getLastBlock = false;
				cb(null, resBlock);
			});
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
				if (res.success && res.block.numberOfTransactions > 0) {
					getBlockTransactions(res, cb);
				} else {
					running.getLastBlock = false;
					cb(null, res);
				}
			});
	};

	const newLastBlock = function (res) {
		return (res.success && data.block === undefined) || (res.block.height > data.block.height);
	};

	const emitLastBlock = function () {
		getLastBlock((err, res) => {
			if (err) {
				log('error', `Error retrieving: ${err}`);
			} else if (newLastBlock(res)) {
				data = res;
			}
			log('info', 'Emitting new data');
			socket.emit('data', data);
		});
	};

	this.onInit = function () {
		emitLastBlock();

		if (interval === null) {
			interval = setInterval(emitLastBlock, 10000);
		}
	};

	this.onConnect = function () {
		log('warn', 'Emitting existing data');
		socket.emit('data', data);
	};

	this.onDisconnect = function () {
		clearInterval(interval);
		interval = null;
		data = {};
	};
};
