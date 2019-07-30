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
			setOffsetAndLimit('/blocks?&sort=height:desc', offset, limit);

		this.inspect = function (blocks, offset) {
			if (_.size(blocks) <= 0) { return; }

			for (let i = 0; i < blocks.length; i++) {
				if (this.volume.blocks >= this.maxCount) { break; }

				const newBlock = blocks[i];
				newBlock.totalAmount = Number(newBlock.totalAmount);
				newBlock.totalFee = Number(newBlock.totalFee);
				newBlock.reward = Number(newBlock.reward);
				newBlock.totalForged = Number(newBlock.totalForged);

				const newAmount = newBlock.totalAmount + newBlock.totalFee;

				this.volume.blocks += 1;
				this.volume.txs += newBlock.numberOfTransactions;
				this.volume.amount += newAmount;

				if (this.best.block === null) {
					this.best.block = newBlock;
				}

				if (newAmount > 0) {
					this.volume.withTxs += 1;

					if (newAmount > this.best.amount) {
						this.best.block = newBlock;
						this.best.amount = newAmount;
					}
				}
			}

			if (Number(offset) === 0) {
				this.volume.beginning = blocks[blocks.length - 1].timestamp;
			} else if (Number(offset) === Number(this.maxOffset)) {
				this.volume.end = blocks[0].timestamp;
			}
		};
	}

	function coreResponseMapper(o) {
		if (!o) return {};
		return {
			blockSignature: o.blockSignature,
			confirmations: o.confirmations,
			generatorId: o.generatorAddress,
			generatorPublicKey: o.generatorPublicKey,
			height: o.height,
			id: o.id,
			numberOfTransactions: o.numberOfTransactions,
			payloadHash: o.payloadHash,
			payloadLength: o.payloadLength,
			previousBlock: o.previousBlockId,
			reward: Number(o.reward),
			timestamp: o.timestamp,
			totalAmount: Number(o.totalAmount),
			totalFee: Number(o.totalFee),
			totalForged: String(o.totalForged),
			version: o.version,
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

					blocks.inspect(body.data, offset);
					return next();
				});
			},
			() => {
				offset += limit;

				return (offset > blocks.maxOffset);
			},
			(err) => {
				if (err) {
					logger.warn(`Error retrieving Blocks: ${err}`);
					return error({ success: false, error: err });
				}

				const bestBlock = coreResponseMapper(blocks.best.block);

				return success({
					success: true,
					best: bestBlock,
					volume: blocks.volume,
				});
			});
	};

	this.getLastBlock = function (query, error, success) {
		const blocks = new Blocks();

		request.get({
			url: app.get('lisk address') + blocks.url(0, 1),
			json: true,
		}, (err, res, body) => {
			if (err || res.statusCode !== 200) {
				return error({ success: false, error: (err || 'Response was unsuccessful') });
			}

			if (body && _.size(body.data) > 0) {
				const block = coreResponseMapper(body.data[0]);
				return success({ success: true, block });
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
			const unknownHostname = `${ip}.unknown`;
			try {
				dns.reverse(ip, (err, hostnames) => {
					let hostname;

					if (err) {
						logger.debug('Locator:', 'Failed to get new hostname for:', ip);
						hostname = unknownHostname;
					} else {
						hostname = hostnames[0];
					}

					return cb(err, hostname);
				});
			} catch (err) {
				cb(err, unknownHostname);
			}
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
			setOffsetAndLimit('/peers?sort=version:desc', offset, limit);

		const osBrands = { unknown: 0, darwin: 1, linux: 2, freebsd: 3 };

		const osBrand = (os) => {
			const match = (os ? os.match(/^[a-z]+/i) : '');
			const name = match ? match[0] : 'unknown';
			const group = osBrands[name] ? osBrands[name] : 0;

			return { name, group };
		};

		this.isPeerPresent = peer => peer && peer.ip && (this.ips.indexOf(peer.ip) > -1);

		this.collect = function (peers, cb) {
			let i = 0;
			const self = this;

			peers = _.reject(peers, p => p.ip === '0.0.0.0');

			async.doUntil(
				(next) => {
					if (this.isPeerPresent(peers[i])) next();
					else self.process(peers[i], next);
				},
				() => {
					i += 1;
					return i >= peers.length;
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

	const peersMapper = function (o) {
		if (!o) return {};
		return {
			ip: o.ip,
			httpPort: o.httpPort || 'n/a',
			wsPort: o.wsPort || 'n/a',
			state: o.state,
			os: o.os,
			version: o.version,
			broadhash: o.broadhash,
			height: o.height,
			osBrand: o.osBrand,
			humanState: o.humanState,
			location: o.location,
		};
	};

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

					if (_.size(body.data) > 0) {
						peers.collect(body.data, () => { next(); });
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

				return success({
					success: true,
					list: {
						connected: (peers.list.connected || []).map(peersMapper),
						disconnected: (peers.list.disconnected || []).map(peersMapper),
					},
				});
			});
	};
};
