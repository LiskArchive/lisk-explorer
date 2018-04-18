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
const logger = require('./logger');

module.exports = function (app, config, client) {
	const delegates = new api.delegates(app);

	function KnownAddresses() {
		let latestDelegateRegisteredAt = -1;

		this.inTx = (tx) => {
			if (tx.senderUsername) {
				tx.knownSender = { owner: tx.senderUsername };
			} else {
				this.getKnownAddress(tx.senderId, (err, data) => {
					tx.knownSender = data;
				});
			}

			if (tx.recipientUsername) {
				tx.knownRecipient = { owner: tx.recipientUsername };
			} else {
				this.getKnownAddress(tx.recipientId, (err, data) => {
					tx.knownRecipient = data;
				});
			}

			return tx;
		};

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

			return client.hmset(`address:${account.address}`, entry);
		};

		this.getKnownAddress = (address, callback) => client.hgetall(`address:${address}`, callback);

		this.loadFromJson = () => {
			try {
				logger.info('KnownAddresses:', 'Loading known addresses...');
				const knownJson = require('../known.json');

				Object.keys(knownJson).forEach((address) => {
					client.hmset(`address:${address}`, knownJson[address]);
				});

				const length = Object.keys(knownJson).length;
				logger.info('KnownAddresses:', `${length} known addresses loaded`);
			} catch (err) {
				logger.error('KnownAddresses: Error loading known.json:', err.message);
			}
		};

		this.checkNewDelegates = () => {
			logger.info('KnownAddresses:', 'Checking new delegates...');

			delegates.getDelegatesFromTimestamp(latestDelegateRegisteredAt + 1, (err, data) => {
				if (err) {
					logger.error('KnownAddresses:', `Error getting new delegates ${err}`);
				} else {
					logger.info(`KnownAddresses: got ${data.length} new delegates from ${latestDelegateRegisteredAt} timestamp`);
					if (Array.isArray(data) && data.length > 0) {
						if (data[0].registeredAt) {
							latestDelegateRegisteredAt = data[0].registeredAt;
						}
						data.map(this.setKnownAddress);
					}
				}
			});
		};

		this.load = () => {
			this.loadFromJson();

			if (config.cacheDelegateAddress.enabled) {
				this.checkNewDelegates();
				setInterval(this.checkNewDelegates, config.cacheDelegateAddress.updateInterval);
			}
		};
	}

	return new KnownAddresses();
};
