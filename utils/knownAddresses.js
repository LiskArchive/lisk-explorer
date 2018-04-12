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
		this.setUsername = (account) => {
			if (!account || !account.address) return false;

			let entry;
			if (account.username) {
				entry = { owner: account.username };
			} else if (account.delegate && account.delegate.username) {
				entry = { owner: account.delegate.username };
			}

			if (entry) {
				return client.hmset(`address:${account.address}`, entry);
			}
			return false;
		};

		this.getUsername = (address, callback) => client.hgetall(`address:${address}`, callback);

		this.isUsernameCached = (address, callback) => client.exists(`address:${address}`, callback);

		this.getOrSetKnowledge = (account, callback) => {
			this.isUsernameCached(account.address, (err, cached) => {
				if (cached) {
					this.getUsername(account.address, callback);
				} else {
					this.setUsername(account);
					this.getUsername(account.address, callback);
				}
			});
		};

		this.load = () => {
			try {
				logger.info('KnownAddresses:', 'Loading known addresses...');
				this.addresses = require('../known.json');

				Object.keys(this.addresses).forEach((address) => {
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
