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

module.exports = function (app, connectionHandler, socket) {
	const blocks = new api.blocks(app);
	const common = new api.common(app);
	const delegates = new api.delegates(app);
	const connection = new connectionHandler('Header:', socket, this);
	let intervals = [];
	let data = {};
	const tmpData = {};

	const running = {
		getBlockStatus: false,
		getPriceTicker: false,
		getDelegateProposals: false,
	};

	const log = (level, msg) => {
		logger[level]('Header:', msg);
	};

	const newInterval = (i, delay, cb) => {
		if (intervals[i] !== undefined) {
			return null;
		}
		intervals[i] = setInterval(cb, delay);
		return intervals[i];
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

	const getDelegateProposals = (cb) => {
		if (running.getDelegateProposals) {
			return cb('getDelegateProposals (already running)');
		}
		running.getDelegateProposals = true;
		return delegates.getDelegateProposals(
			() => { running.getDelegateProposals = false; cb('DelegateProposals'); },
			(res) => { running.getDelegateProposals = false; cb(null, res); });
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
				log('info', 'Emitting data');
				socket.emit('data', thisData);
			}
		});
	};

	const emitDelegateProposals = () => {
		if (!config.proposals.enabled) {
			return false;
		}

		return async.parallel([
			getDelegateProposals,
		],
		(err, res) => {
			if (err) {
				log('error', `Error retrieving: ${err}`);
			} else {
				tmpData.proposals = res[0];
			}

			log('info', 'Emitting updated delegate proposals');
			socket.emit('delegateProposals', tmpData.proposals);
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

				log('info', 'Emitting new data');
				socket.emit('data', data);

				newInterval(0, 10000, emitData);
				// Update and emit delegate proposals every 10 minutes by default
				newInterval(1, config.proposals.updateInterval || 600000, emitDelegateProposals);
			}
		});

		emitDelegateProposals();
	};

	this.onConnect = function () {
		log('info', 'Emitting existing delegate proposals');
		socket.emit('delegateProposals', tmpData.proposals);

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
