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
const logger = require('./logger');
const request = require('request-promise');

module.exports = function (app, config, client) {
	const delegates = app.delegates;

	function KnownAddresses() {
		this.latestDelegateRegisteredAt = -1;
		this.totalDelegates = 0;

		this.setKnowledge = (account, cb) => {
			if (!account || !account.address) return cb('Missing attribute: address');

			return this.getKnownAddress(account.address, (err, data) => {
				account.knowledge = data;
				cb(err, account);
			});
		};

		this.setKnownAddress = (account) => {
			if (!account || !account.address) return false;

			let entry;
			if (account.username) {
				entry = { owner: account.username };
			} else if (account.delegate && account.delegate.username) {
				entry = { owner: account.delegate.username };
			} else {
				return false;
			}

			const writeToHmset = (key, value) => {
				client.hmset(key, value, (err) => {
					if (err) logger.error(err.message);
				});
			};

			writeToHmset(`username:${entry.owner}`, { address: account.address });
			writeToHmset(`address:${account.address}`, entry);

			return true;
		};

		this.getKnownAddress = (address, callback) => client.hgetall(`address:${address}`, callback);

		const getFromHmset = key => new Promise((resolve, reject) => {
			client.hgetall(key, (err, result) => {
				if (err) reject(err.message);
				resolve(result || {});
			});
		});

		const getKeys = key => new Promise((resolve, reject) => {
			client.keys(key, (err, result) => {
				if (err) reject(err.message);
				resolve(result || {});
			});
		});

		const deleteKey = key => new Promise((resolve, reject) => {
			client.unlink(key, (err, result) => {
				if (err) reject(err.message);
				resolve(result);
			});
		});

		this.getByAddress = async address => getFromHmset(`address:${address}`);
		this.getByUser = async username => getFromHmset(`username:${username}`);

		this.loadFromServer = () => {
			try {
				const { nethash } = app.get('nodeConstants');
				let knownNetworks;
				let knownAccounts;

				(async () => {
					try {
						logger.info('KnownAddresses:', `Loading known addresses from ${config.knownAccountsUrl}`);
						knownNetworks = JSON.parse(await request(`${config.knownAccountsUrl}/networks.json`));
						knownAccounts = JSON.parse(await request(`${config.knownAccountsUrl}/known_${knownNetworks[nethash]}.json`));
					} catch (err) {
						logger.warn('KnownAddresses:', `Failed to get known addresses from ${config.knownAccountsUrl}, falling back to the local copy`);
						knownNetworks = require('../knowledge/networks.json') || {};
						// eslint-disable-next-line import/no-dynamic-require
						knownAccounts = require(`../knowledge/known_${knownNetworks[nethash]}.json`) || {};
					}

					Object.keys(knownAccounts).forEach((address) => {
						client.hmset(`address:${address}`, knownAccounts[address]);
					});

					const length = Object.keys(knownAccounts).length;
					logger.info('KnownAddresses:', `${length} known addresses loaded`);
				})();
			} catch (err) {
				logger.error('KnownAddresses: Error loading known.json:', err.message);
			}
		};

		this.checkNewDelegates = () => {
			logger.info('KnownAddresses:', 'Checking new delegates...');

			delegates.getDelegatesFromTimestamp(this.latestDelegateRegisteredAt + 1, (err, data) => {
				if (err) {
					logger.error('KnownAddresses:', `Error getting new delegates ${err}`);
				} else {
					logger.info(`KnownAddresses: got ${data.length} new delegates from ${this.latestDelegateRegisteredAt < 0 || '0'} timestamp`);
					if (Array.isArray(data) && data.length > 0) {
						this.totalDelegates += data.length;
						if (data[0].registeredAt) {
							this.latestDelegateRegisteredAt = data[0].registeredAt;
						}
						data.map(this.setKnownAddress);
					}
				}
			});
		};

		this.load = async () => {
			const addresses = await getKeys('address:*');
			const usernames = await getKeys('username:*');
			if (Array.isArray(addresses)) addresses.map(key => deleteKey(key));
			if (Array.isArray(usernames)) usernames.map(key => deleteKey(key));

			this.loadFromServer();

			if (config.cacheDelegateAddress.enabled) {
				this.checkNewDelegates();
				setInterval(this.checkNewDelegates, config.cacheDelegateAddress.updateInterval);
			}
		};
	}

	return new KnownAddresses();
};
