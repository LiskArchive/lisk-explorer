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
const node = require('./../node.js');

const params = {
	blockHeight: 1,
	blockId: '16821502558291654665',
	transactionId: '1465651642158264047',
	address: '16313739661670634666L',
	publicKey: 'c094ebee7ec0c50ebee32918655e089f6e1a604b83bcaa760293c61e0f18ab6f',
	address_lowercase: '16313739661670634666l',
	offset: 20,
	limit: 100,
};

describe('Transactions API', () => {
	/* Define functions for use within tests */
	function getTransaction(id, done) {
		node.get(`/api/getTransaction?transactionId=${id}`, done);
	}

	function getUnconfirmedTransactions(done) {
		node.get('/api/getUnconfirmedTransactions', done);
	}

	function getLastTransactions(done) {
		node.get('/api/getLastTransactions', done);
	}

	function getTransactions(query, done) {
		node.get(`/api/getTransactions?${query}`, done);
	}

	function getTransactionsByAddress(id, id2, id3, done) {
		node.get(`/api/getTransactionsByAddress?address=${id}&offset=${id2}&limit=${id3}`, done);
	}

	function getTransactionsByBlock(id, id2, id3, done) {
		node.get(`/api/getTransactionsByBlock?blockId=${id}&offset=${id2}&limit=${id3}`, done);
	}

	function checkTransactionTypes(o) {
		node.expect(o.recipientId).to.be.a('string');
		node.expect(o.senderId).to.be.a('string');
		node.expect(o.senderPublicKey).to.be.a('string');
		node.expect(o.timestamp).to.be.a('number');
		node.expect(o.type).to.be.a('number');
		node.expect(o.blockId).to.be.a('string');
		node.expect(o.height).to.be.a('number');
		node.expect(o.id).to.be.a('string');
		node.expect(o.amount).to.be.a('number');
		node.expect(o.fee).to.be.a('number');
		node.expect(o.signature).to.be.a('string');
		node.expect(o.signatures).to.be.a('array');
		node.expect(o.confirmations).to.be.a('number');
		node.expect(o.asset).to.be.a('object');
		node.expect(o.recipientPublicKey).to.be.a('string');
		node.expect(o.knownSender).to.satisfy(knownSender => !knownSender || typeof knownSender === 'object');
		node.expect(o.knownRecipient).to.satisfy(knownRecipient => !knownRecipient || typeof knownRecipient === 'object');
	}

	function checkTransaction(o) {
		node.expect(o).to.contain.all.keys(
			'recipientId',
			'senderId',
			'senderPublicKey',
			'knownSender',
			'timestamp',
			'type',
			'blockId',
			'height',
			'id',
			'amount',
			'fee',
			'signature',
			'signatures',
			'confirmations',
			'asset',
			'knownRecipient',
			'recipientPublicKey');

		checkTransactionTypes(o);
	}

	function checkTransactions(txs, checkAttribute) {
		for (let i = 0; i < txs.length; i++) {
			if (checkAttribute) {
				node.expect(txs[i]).to.satisfy(checkAttribute);
			}
			checkTransaction(txs[i]);
		}
	}

	/* Define api endpoints to test */
	describe('GET /api/getTransaction', () => {
		it('should be ok with Genesis transaction', (done) => {
			getTransaction(params.transactionId, (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body).to.have.property('transaction');
				checkTransaction(res.body.transaction);
				done();
			});
		});

		it('should be not ok with no transaction', (done) => {
			getTransaction('', (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(false);
				node.expect(res.body).to.have.property('error');
				done();
			});
		});
	});

	describe('GET /api/getUnconfirmedTransactions', () => {
		it('should be ok', (done) => {
			getUnconfirmedTransactions((err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body).to.have.property('transactions').to.be.an('array');
				done();
			});
		});
	});

	describe('GET /api/getLastTransactions', () => {
		it('should be ok', (done) => {
			getLastTransactions((err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body).to.have.property('transactions').that.is.an('array');
				checkTransactions(res.body.transactions);
				done();
			});
		});
	});

	describe('GET /api/getTransactions', () => {
		it('using no params should be ok', (done) => {
			getTransactions('', (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body).to.have.property('transactions').that.is.an('array');
				node.expect(res.body.transactions).to.have.lengthOf(100);
				checkTransactions(res.body.transactions);
				done();
			});
		});

		it('using senderId should be ok', (done) => {
			getTransactions(`senderId=${params.address}`, (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body).to.have.property('transactions').that.is.an('array');
				node.expect(res.body.transactions).to.have.lengthOf(100);
				checkTransactions(res.body.transactions, tx => (tx.senderId === params.address));
				done();
			});
		});

		it('using senderPublicKey id should be ok', (done) => {
			getTransactions(`senderPublicKey=${params.publicKey}`, (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body).to.have.property('transactions').that.is.an('array');
				node.expect(res.body.transactions).to.have.lengthOf(100);
				checkTransactions(res.body.transactions, tx => (tx.senderPublicKey === params.publicKey));
				done();
			});
		});

		it('using recipientId should be ok', (done) => {
			getTransactions(`recipientId=${params.address}`, (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body).to.have.property('transactions').that.is.an('array');
				node.expect(res.body.transactions).to.have.lengthOf(2);
				checkTransactions(res.body.transactions, tx => (tx.recipientId === params.address));
				done();
			});
		});

		it('using recipientPublicKey id should be ok', (done) => {
			getTransactions(`recipientPublicKey=${params.publicKey}`, (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body).to.have.property('transactions').that.is.an('array');
				node.expect(res.body.transactions).to.have.lengthOf(2);
				checkTransactions(res.body.transactions, tx => (tx.recipientPublicKey === params.publicKey));
				done();
			});
		});

		it('using height id should be ok', (done) => {
			getTransactions(`height=${params.blockHeight}`, (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body).to.have.property('transactions').that.is.an('array');
				node.expect(res.body.transactions).to.have.lengthOf(100);
				checkTransactions(res.body.transactions, tx => (tx.height === params.blockHeight));
				done();
			});
		});

		it('using blockId id should be ok', (done) => {
			getTransactions(`blockId=${params.blockId}`, (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body).to.have.property('transactions').that.is.an('array');
				node.expect(res.body.transactions).to.have.lengthOf(25);
				checkTransactions(res.body.transactions, tx => (tx.blockId === params.blockId));
				done();
			});
		});

		it('using minAmount id should be ok', (done) => {
			const minAmount = 10000 * 1e8;
			getTransactions(`minAmount=${minAmount}`, (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body).to.have.property('transactions').that.is.an('array');
				node.expect(res.body.transactions).to.have.lengthOf(3);
				checkTransactions(res.body.transactions, tx => (tx.amount >= minAmount));
				done();
			});
		});

		it('using maxAmount id should be ok', (done) => {
			const maxAmount = 100 * 1e8;
			getTransactions(`maxAmount=${maxAmount}`, (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body).to.have.property('transactions').that.is.an('array');
				node.expect(res.body.transactions).to.have.lengthOf(100);
				checkTransactions(res.body.transactions, tx => (tx.amount <= maxAmount));
				done();
			});
		});

		it('using fromTimestamp id should be ok', (done) => {
			const fromTimestamp = 33505109;
			getTransactions(`fromTimestamp=${fromTimestamp}`, (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body).to.have.property('transactions').that.is.an('array');
				node.expect(res.body.transactions).to.have.lengthOf(100);
				checkTransactions(res.body.transactions, tx => (tx.timestamp >= fromTimestamp));
				done();
			});
		});

		it('using toTimestamp id should be ok', (done) => {
			const toTimestamp = 33505109;
			getTransactions(`toTimestamp=${toTimestamp}`, (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body).to.have.property('transactions').that.is.an('array');
				node.expect(res.body.transactions).to.have.lengthOf(100);
				checkTransactions(res.body.transactions, tx => (tx.timestamp <= toTimestamp));
				done();
			});
		});

		it('using invalid address should return empty array', (done) => {
			getTransactions('recipientId=qwerty', (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(false);
				node.expect(res.body).to.have.property('error');
				done();
			});
		});
	});

	describe('GET /api/getTransactionsByAddress', () => {
		it('using known address should be ok', (done) => {
			getTransactionsByAddress(params.address, '0', params.limit, (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body).to.have.property('transactions').that.is.an('array');
				checkTransactions(res.body.transactions);
				done();
			});
		});

		it('using known address with lowercase l should be ok', (done) => {
			getTransactionsByAddress(params.address_lowercase, '0', params.limit, (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body).to.have.property('transactions').that.is.an('array');
				checkTransactions(res.body.transactions);
				done();
			});
		});

		it('using known address and offset of 20 should be ok', (done) => {
			getTransactionsByAddress(params.address, params.offset, params.limit, (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body).to.have.property('transactions').that.is.an('array');
				checkTransactions(res.body.transactions);
				done();
			});
		});

		it('using invalid address should fail', (done) => {
			getTransactionsByAddress('', '0', params.limit, (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(false);
				node.expect(res.body).to.have.property('error');
				done();
			});
		});
	});

	describe('GET /api/getTransactionsByBlock', () => {
		it('using known block should be ok', (done) => {
			getTransactionsByBlock(params.blockId, '0', params.limit, (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body).to.have.property('transactions').that.is.an('array');
				checkTransactions(res.body.transactions);
				done();
			});
		});

		it('using known block and offset of 20 should be ok', (done) => {
			getTransactionsByBlock(params.blockId, params.offset, params.limit, (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body).to.have.property('transactions');
				checkTransactions(res.body.transactions);
				done();
			});
		});

		it('using invalid block should fail', (done) => {
			getTransactionsByBlock('', '0', params.limit, (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(false);
				node.expect(res.body).to.have.property('error');
				done();
			});
		});
	});
});
