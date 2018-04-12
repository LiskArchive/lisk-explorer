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
const config = require('../config');
const client = require('../redis')(config);
const logger = require('./logger');

module.exports = function () {
	function KnownAddresses() {
		this.addresses = {};

		this.inTx = (tx) => {
			if (tx.senderUsername) {
				tx.knownSender = { owner: tx.senderUsername };
			} else {
				tx.knownSender = this.inAddress(tx.senderId);
			}
			if (tx.senderId === tx.recipientId) {
				tx.recipientUsername = tx.senderUsername;
			}
			if (tx.recipientUsername) {
				tx.knownRecipient = { owner: tx.recipientUsername };
			} else {
				tx.knownRecipient = this.inAddress(tx.recipientId);
			}
			return tx;
		};

		this.inAccount = (account) => {
			if (account.username) {
				return { owner: account.username };
			}
			return this.inAddress(account.address);
		};

		this.inAddress = address => this.addresses[address] || null;

		this.inDelegate = (delegate) => {
			if (delegate) {
				return { owner: delegate.username };
			}
			return null;
		};

		// Entry expires every day (86400 seconds) in case new delegate is registered
		this.setAddress = (account) => {
			if (!account || !account.address) return false;

			let value = {};
			if (account.username) {
				value = { owner: account.username };
			} else if (account.delegate && account.delegate.username) {
				value = { owner: account.delegate.username };
			}

			client.hmset(`address:${account.address}`, value);
			client.expire(`address:${account.address}`, 86400);
			return true;
		};

		this.getAddress = (address, callback) => client.hgetall(`address:${address}`, callback);

		this.isAddressCached = (address, callback) => client.exists(`address:${address}`, callback);

		this.getOrSetKnowledge = (account, callback) => {
			this.getAddress(account.address, (err, reply) => {
				if (reply) {
					callback(err, reply);
				} else {
					this.setAddress(account);
					this.getAddress(account.address, callback);
				}
			});
		};

		this.load = () => {
			try {
				logger.info('KnownAddresses:', 'Loading known addresses...');
				this.addresses = require('../known.json');

				this.addresses.keys.array.forEach((address) => {
					client.hmset(`address:${address}`, this.addresses[address]);
				});
			} catch (err) {
				logger.error('KnownAddresses:', 'Error loading known.json:', err.message);
				this.addresses = {};
			}

			const length = Object.keys(this.addresses).length.toString();
			logger.info('KnownAddresses:', length, 'known addresses loaded');
			return this.addresses;
		};

		// Load on initialization
		this.load();
	}

	return new KnownAddresses();
};
