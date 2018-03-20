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
const moment = require('moment');
const async = require('async');
const request = require('request');
const logger = require('../utils/logger');

module.exports = function (app, connectionHandler, socket) {
	const delegates = new api.delegates(app);
	const connection = new connectionHandler('Delegate Monitor:', socket, this);
	let intervals = [];
	const data = {};
	// Only used in various calculations, will not be emitted directly
	const tmpData = {};

	const running = {
		getActive: false,
		getLastBlock: false,
		getRegistrations: false,
		getVotes: false,
		getLastBlocks: false,
		getNextForgers: false,
	};

	const newInterval = function (i, delay, cb) {
		if (intervals[i] !== undefined) {
			return null;
		}
		intervals[i] = setInterval(cb, delay);
		return intervals[i];
	};

	const log = (level, msg) => logger[level]('Delegate Monitor:', msg);

	const findActiveByPublicKey = delegate =>
		data.active.delegates.find(d => d.account.publicKey === delegate.publicKey);

	const cutNextForgers = () => {
		const next10Forgers = tmpData.nextForgers.delegates.slice(0, 10);
		return next10Forgers.map(publicKey => findActiveByPublicKey(publicKey));
	};

	const getActive = (cb) => {
		if (running.getActive) {
			return cb('getActive (already running)');
		}
		running.getActive = true;
		return delegates.getActive(
			'preserved',
			() => { running.getActive = false; cb('Active'); },
			(res) => { running.getActive = false; cb(null, res); });
	};

	const findActive = delegate =>
		data.active.delegates.find(d => d.account.publicKey === delegate.account.publicKey);

	const findActiveByBlock = block =>
		data.active.delegates.find(d => d.account.publicKey === block.generatorPublicKey);

	const updateDelegate = (delegate, updateForgingTime) => {
		// Update delegate with forging time
		if (updateForgingTime) {
			delegate.forgingTime = tmpData.nextForgers.delegates.indexOf(delegate.publicKey) * 10;
		}

		// Update delegate with info if should forge in current round
		if (tmpData.roundDelegates.indexOf(delegate.publicKey) === -1) {
			delegate.isRoundDelegate = false;
		} else {
			delegate.isRoundDelegate = true;
		}
		return delegate;
	};

	const getLastBlock = (cb) => {
		if (running.getLastBlock) {
			return cb('getLastBlock (already running)');
		}
		running.getLastBlock = true;
		return delegates.getLastBlock(
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

	const getRegistrations = (cb) => {
		if (running.getRegistrations) {
			return cb('getRegistrations (already running)');
		}
		running.getRegistrations = true;
		return delegates.getLatestRegistrations(
			'preserved',
			() => {
				running.getRegistrations = false;
				cb('Registrations');
			},
			(res) => {
				running.getRegistrations = false;
				cb(null, res);
			});
	};

	const getVotes = (cb) => {
		if (running.getVotes) {
			return cb('getVotes (already running)');
		}
		running.getVotes = true;
		return delegates.getLatestVotes(
			'preserved',
			() => {
				running.getVotes = false;
				cb('Votes');
			},
			(res) => {
				running.getVotes = false;
				cb(null, res);
			});
	};

	const getNextForgers = (cb) => {
		if (running.getNextForgers) {
			return cb('getNextForgers (already running)');
		}
		running.getNextForgers = true;
		return delegates.getNextForgers(
			'preserved',
			() => {
				running.getNextForgers = false;
				cb('NextForgers');
			},
			(res) => {
				running.getNextForgers = false;
				cb(null, res);
			});
	};

	const delegateName = delegate => `${delegate.username}[${delegate.rate}]`;

	const emitDelegate = (delegate) => {
		log('info', `Emitting last blocks for: ${delegateName(delegate)}`);
		socket.emit('delegate', delegate);
	};

	const getLastBlocks = (init) => {
		const limit = init ? 100 : 2;

		if (running.getLastBlocks) {
			return log('error', 'getLastBlocks (already running)');
		}
		running.getLastBlocks = true;

		return async.waterfall([
			(callback) => {
				request.get({
					url: `${app.get('lisk address')}/api/blocks?sort=height:desc&limit=${limit}`,
					json: true,
				}, (err, response, body) => {
					if (err || response.statusCode !== 200) {
						return callback((err || 'Response was unsuccessful'));
					} else if (body.data) {
						return callback(null, { blocks: body.data });
					}
					return callback(body.error);
				});
			},
			(result, callback) => {
				// Set last block and his delegate (we will emit it later in emitData)
				data.lastBlock.block = result.blocks[0];
				const lastBlockDelegate = findActiveByBlock(data.lastBlock.block);
				data.lastBlock.block.delegate = {
					username: lastBlockDelegate.username,
					address: lastBlockDelegate.address,
				};

				async.eachSeries(result.blocks, (b, cb) => {
					let existing = findActiveByBlock(b);

					if (existing) {
						if (!existing.blocks || !existing.blocks[0] ||
							existing.blocks[0].timestamp < b.timestamp) {
							existing.blocks = [];
							existing.blocks.push(b);
							existing.blocksAt = moment();
							existing = updateDelegate(existing, false);
							emitDelegate(existing);
						}
					}

					if (intervals[1]) {
						cb(null);
					} else {
						callback('Monitor closed');
					}
				}, (err) => {
					if (err) {
						callback(err, result);
					}
					callback(null, result);
				});
			},
			(result, callback) => {
				async.eachSeries(data.active.delegates, (delegate, cb) => {
					if (delegate.blocks) {
						return cb(null);
					}
					return delegates.getLastBlocks(
						{ publicKey: delegate.publicKey,
							limit: 1 },
						(res) => {
							log('error', `Error retrieving last blocks for: ${delegateName(delegate)}`);
							callback(res.error);
						},
						(res) => {
							let existing = findActive(delegate);

							if (existing) {
								existing.blocks = res.blocks;
								existing.blocksAt = moment();
								existing = updateDelegate(existing, false);
								emitDelegate(existing);
							}

							if (intervals[1]) {
								cb(null);
							} else {
								callback('Monitor closed');
							}
						});
				}, (err) => {
					if (err) {
						callback(err, result);
					}
					callback(null, result);
				});
			},
		], (err) => {
			if (err) {
				log('error', `Error retrieving LastBlocks: ${err}`);
			}
			running.getLastBlocks = false;
		});
	};

	const getRound = height => Math.ceil(height / 101);

	const getRoundDelegates = (nextForgers, height) => {
		const currentRound = getRound(height);
		return nextForgers.filter((delegate, index) =>
			currentRound === getRound(height + index + 1));
	};

	const updateActive = (results) => {
		// Calculate list of delegates that should forge in current round
		tmpData.roundDelegates = getRoundDelegates(tmpData.nextForgers.delegates,
			data.lastBlock.block.height);

		if (!data.active || !data.active.delegates) {
			return results;
		}
		results.delegates.forEach((delegate) => {
			const existing = findActive(delegate);

			if (existing) {
				delegate = updateDelegate(delegate, true);
			}

			if (existing && existing.blocks && existing.blocksAt) {
				delegate.blocks = existing.blocks;
				delegate.blocksAt = existing.blocksAt;
			}
		});

		return results;
	};

	const emitData = () => {
		async.parallel([
			getActive,
			getRegistrations,
			getVotes,
			getNextForgers,
		],
		(err, res) => {
			if (err) {
				log('error', `Error retrieving: ${err}`);
			} else {
				tmpData.nextForgers = res[3];

				data.active = updateActive(res[0]);
				data.registrations = res[1];
				data.votes = res[2];
				data.nextForgers = cutNextForgers(10);

				log('info', 'Emitting data');
				socket.emit('data', data);
			}
		});
	};

	this.onInit = function () {
		this.onConnect();

		async.parallel([
			// We only call getLastBlock on init, later data.lastBlock will be updated from getLastBlocks
			getLastBlock,
			getActive,
			getRegistrations,
			getVotes,
			getNextForgers,
		],
		(err, res) => {
			if (err) {
				log('error', `Error retrieving: ${err}`);
			} else {
				tmpData.nextForgers = res[4];

				data.lastBlock = res[0];
				data.active = updateActive(res[1]);
				data.registrations = res[2];
				data.votes = res[3];
				data.nextForgers = cutNextForgers(10);

				log('info', 'Emitting new data');
				socket.emit('data', data);

				getLastBlocks(data.active, true);

				newInterval(0, 5000, emitData);
				newInterval(1, 1000, getLastBlocks);
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
