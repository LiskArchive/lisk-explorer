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
	blockId: '6524861224470851795',
	transactionId: '1465651642158264047',
	address: '16313739661670634666L',
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

	function checkTransactions(txs) {
		for (let i = 0; i < txs.length; i++) {
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
		}).timeout(10000);
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
		}).timeout(5000);

		it('using known block and offset of 20 should be ok', (done) => {
			getTransactionsByBlock(params.blockId, params.offset, params.limit, (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body).to.have.property('transactions');
				checkTransactions(res.body.transactions);
				done();
			});
		}).timeout(5000);

		it('using invalid block should fail', (done) => {
			getTransactionsByBlock('', '0', params.limit, (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(false);
				node.expect(res.body).to.have.property('error');
				done();
			});
		});
	});
});
