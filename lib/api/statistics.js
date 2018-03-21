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
const request = require('request');
const _ = require('underscore');
const async = require('async');
const dns = require('dns');
const logger = require('../../utils/logger');

module.exports = function (app) {
	const setOffsetAndLimit = (url, offset, limit) => {
		if (!isNaN(offset)) {
			url += `&offset=${offset}`;
		}
		if (!isNaN(limit)) {
			url += `&limit=${limit}`;
		}

		return url;
	};

	function Blocks() {
		this.maxOffset = 8600; // 8700
		this.maxCount = 8640; // 24 hours

		this.best = {
			block: null,
			amount: 0,
		};

		this.volume = {
			amount: 0,
			blocks: 0,
			txs: 0,
			withTxs: 0,
			beginning: null,
			end: null,
		};

		this.url = (offset, limit) =>
			setOffsetAndLimit('/api/blocks?&orderBy=height:desc', offset, limit);

		this.inspect = function (blocks, offset) {
			if (_.size(blocks) <= 0) { return; }

			for (let i = 0; i < blocks.length; i++) {
				if (this.volume.blocks >= this.maxCount) { break; }

				const newBlock = blocks[i];
				const newAmount = (newBlock.totalAmount + newBlock.totalFee);

				this.volume.blocks += 1;
				this.volume.txs += newBlock.numberOfTransactions;
				this.volume.amount += newAmount;

				if (newAmount > 0) {
					this.volume.withTxs += 1;

					if (newAmount > this.best.amount) {
						this.best.block = newBlock;
						this.best.amount = newAmount;
					}
				}
			}

			if (offset === 0) {
				this.volume.beginning = blocks[blocks.length - 1].timestamp;
			} else if (offset === this.maxOffset) {
				this.volume.end = blocks[0].timestamp;
			}
		};
	}

	this.getBlocks = function (query, error, success) {
		let offset = 0;
		const limit = 100;
		const blocks = new Blocks();

		async.doUntil(
			(next) => {
				request.get({
					url: app.get('lisk address') + blocks.url(offset, limit),
					json: true,
				}, (err, resp, body) => {
					if (err || resp.statusCode !== 200) {
						return next(err || 'Response was unsuccessful');
					}

					blocks.inspect(body.blocks, offset);
					return next();
				});
			},
			() => {
				offset += limit;

				return (offset > blocks.maxOffset);
			},
			(err) => {
				if (err) {
					logger.info(`Error retrieving Blocks: ${err}`);
					return error({ success: false, error: err });
				}
				return success({
					success: true,
					best: blocks.best.block,
					volume: blocks.volume,
				});
			});
	};

	this.getLastBlock = function (query, error, success) {
		const blocks = new Blocks();

		request.get({
			url: app.get('lisk address') + blocks.url(0, 1),
			json: true,
		}, (err, resp, body) => {
			if (err || resp.statusCode !== 200) {
				return error({ success: false, error: (err || 'Response was unsuccessful') });
			}

			if (_.size(body.blocks) > 0) {
				return success({ success: true, block: body.blocks[0] });
			}
			return error({ success: false, error: body.error });
		});
	};

	function Locator() {
		this.disabled = false;
		const cache = {};

		const getFreegeoip = (ip, cb) => {
			request.get({
				url: `${app.get('freegeoip address')}/json/${ip}`,
				json: true,
			}, (err, resp, body) => {
				if (err || resp.statusCode !== 200) {
					logger.debug('Locator:', 'Failed to get new location for:', ip);
					return cb(err);
				}
				return cb(null, body);
			});
		};

		const getHostName = (ip, cb) => {
			dns.reverse(ip, (err, hostnames) => {
				let hostname;

				if (err) {
					logger.debug('Locator:', 'Failed to get new hostname for:', ip);
					hostname = `${ip}.unknown`;
				} else {
					hostname = hostnames[0];
				}

				return cb(err, hostname);
			});
		};

		const getLocation = (ip, cb) => {
			async.parallel([
				function (callback) { getFreegeoip(ip, callback); },
				function (callback) { getHostName(ip, callback); },
			],
			(err, res) => {
				if (err) {
					logger.debug('Locator:', 'Error retrieving location:', err);
				}

				const data = res[0] || {};
				data.hostname = res[1];

				cache[ip] = data;
				return cb(data);
			});
		};

		this.locate = function (ip, cb) {
			const location = cache[ip];

			if (this.disabled) {
				return cb(null);
			} else if (location) {
				logger.trace('Locator:', 'Using cached location for:', ip);
				return cb(location);
			}
			logger.trace('Locator:', 'Requesting new location for:', ip);
			return getLocation(ip, cb);
		};

		this.update = (ips) => {
			const cacheKeys = Object.keys(cache);
			/**
			 * @todo replace this with forEAch after adding babel
			 */
			for (let i = 0; i < cacheKeys.length; i++) {
				if (ips.indexOf(cacheKeys[i]) === -1) {
					logger.debug('Locator', 'Removing stale location:', cacheKeys[i]);
					delete cache[cacheKeys[i]];
				}
			}
		};
	}

	this.locator = new Locator();

	function Peers(locator) {
		this.maxOffset = 900; // 1000

		this.list = {
			connected: [], // 1
			disconnected: [], // 2
		};

		this.ips = [];
		this.locations = locator;

		this.url = (offset, limit) =>
			setOffsetAndLimit('/api/peers?orderBy=ip:asc', offset, limit);

		const osBrands = { unknown: 0, darwin: 1, linux: 2, freebsd: 3 };

		const osBrand = (os) => {
			const match = (os ? os.match(/^[a-z]+/i) : '');
			const name = match ? match[0] : 'unknown';
			const group = osBrands[name] ? osBrands[name] : 0;

			return { name, group };
		};

		this.collect = function (peers, cb) {
			let i = 0;
			const self = this;

			peers = _.reject(peers, p => p.ip === '0.0.0.0');

			async.doUntil(
				(next) => {
					self.process(peers[i], next);
				},
				() => {
					i += 1;

					return (i + 1) > peers.length;
				},
				(err) => {
					if (err) {
						logger.error(`Error collecting peers: ${err}`);
						cb([]);
					} else {
						cb(peers);
					}
				});
		};

		/**
		 * @todo Should I remove the last return statement or return all other functions?
		 */
		/* eslint-disable consistent-return */
		this.process = function (p, next) {
			p.osBrand = osBrand(p.os);
			this.ips.push(p.ip);

			switch (parseInt(p.state, 10)) {
			case 1:
				p.humanState = 'Disconnected';
				this.list.disconnected.push(p);
				this.locations.locate(p.ip, (res) => {
					p.location = res;
					return next();
				});
				break;
			case 2:
				if (p.height !== null) {
					p.humanState = 'Connected';
					this.list.connected.push(p);
				} else {
					p.humanState = 'Connected';
					this.list.disconnected.push(p);
				}
				this.locations.locate(p.ip, (res) => {
					p.location = res;
					return next();
				});
				break;
			case 0:
				if (p.height !== null) {
					p.humanState = 'Unknown';
					this.list.connected.push(p);
				} else {
					p.humanState = 'Unknown';
					this.list.disconnected.push(p);
				}
				this.locations.locate(p.ip, (res) => {
					p.location = res;
					return next();
				});
				break;
			default:
				return next();
			}
		};
		/* eslint-enable consistent-return */
	}

	this.getPeers = function (query, error, success) {
		let offset = 0;
		const limit = 100;
		const peers = new Peers(this.locator);
		let found = false;

		async.doUntil(
			(next) => {
				logger.debug(`Requesting ${app.get('lisk address') + peers.url(offset, limit)}`);
				request.get({
					url: app.get('lisk address') + peers.url(offset, limit),
					json: true,
				},
				/* eslint-disable consistent-return */
				(err, resp, body) => {
					if (err || resp.statusCode !== 200) {
						return next(err || 'Response was unsuccessful');
					}

					if (_.size(body.peers) > 0) {
						peers.collect(body.peers, () => { next(); });
					} else {
						found = true;
						return next();
					}
				});
			},
			() => {
				offset += limit;

				return found || (offset > peers.maxOffset);
			},
			(err) => {
				peers.locations.update(peers.ips);

				if (err) {
					logger.error(`Error retrieving Peers: ${err}`);
					return error({ success: false, error: err });
				}
				return success({ success: true, list: peers.list });
			});
	};
};
