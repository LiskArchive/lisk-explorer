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
			if (account.delegate) {
				return { owner: account.delegate.username };
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

		this.load = () => {
			try {
				logger.info('KnownAddresses:', 'Loading known addresses...');
				this.addresses = require('../known.json');
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
