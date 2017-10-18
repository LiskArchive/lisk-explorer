const api = require('../lib/api');
const async = require('async');
const logger = require('../utils/logger');

module.exports = function (app, connectionHandler, socket) {
	const blocks = new api.blocks(app);
	const common = new api.common(app);
	const connection = new connectionHandler('Header:', socket, this);
	let intervals = [];
	let data = {};
	const tmpData = {};

	const running = {
		getBlockStatus: false,
		getPriceTicker: false,
		// getDelegateProposals: false,
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
			() => { running.getBlockStatus = false; cb('Status'); },
			(res) => { running.getBlockStatus = false; cb(null, res); });
	};

	const getPriceTicker = (cb) => {
		if (running.getPriceTicker) {
			return cb('getPriceTicker (already running)');
		}
		running.getPriceTicker = true;
		return common.getPriceTicker(
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
				log('info', 'Emitting data');
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

				log('info', 'Emitting new data');
				socket.emit('data', data);

				newInterval(0, 10000, emitData);
				// Update and emit delegate proposals every 10 minutes by default
			}
		});
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
