const node = require('./../node.js');

const params = {
	blockId: '6524861224470851795',
	transactionId: '1465651642158264047',
	address: '16313739661670634666L',
	offset: 20,
	limit: 100,
};

describe.skip('Transactions API', () => {
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

	function checkTransactionsBody(id) {
		for (let i = 0; i < id.length; i++) {
			if (id[i + 1]) {
				node.expect(id[i]).to.contain.all.keys(
					'recipientId',
					'senderId',
					'senderPublicKey',
					'senderDelegate',
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
					'recipientDelegate',
					'knownRecipient',
					'recipientPublicKey');
			}
		}
	}

	/* Define api endpoints to test */
	describe('GET /api/getTransaction', () => {
		it('should be ok with Genesis transaction', (done) => {
			getTransaction(params.transactionId, (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body).to.have.property('transaction');
				node.expect(res.body.transaction).to.contain.all.keys(
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

	/* We are skipping this temporarily, theres a call back error that needs to be fixed */
	describe('GET /api/getUnconfirmedTransactions', () => {
		it.skip('should be ok', (done) => {
			getUnconfirmedTransactions((err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				done();
			});
		});
	});

	describe('GET /api/getLastTransactions', () => {
		it('should be ok', (done) => {
			getLastTransactions((err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body).to.have.property('transactions').that.is.an('array');
				checkTransactionsBody(res.body.transactions);
				done();
			});
		}).timeout(10000);
	});

	describe('GET /api/getTransactionsByAddress', () => {
		it('using known address should be ok', (done) => {
			getTransactionsByAddress(params.address, '0', params.limit, (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body).to.have.property('transactions').that.is.an('array');
				checkTransactionsBody(res.body.transactions);
				done();
			});
		});

		it('using known address and offset of 20 should be ok', (done) => {
			getTransactionsByAddress(params.address, params.offset, params.limit, (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body).to.have.property('transactions').that.is.an('array');
				checkTransactionsBody(res.body.transactions);
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
				checkTransactionsBody(res.body.transactions);
				done();
			});
		}).timeout(5000);

		it('using known block and offset of 20 should be ok', (done) => {
			getTransactionsByBlock(params.blockId, params.offset, params.limit, (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body).to.have.property('transactions');
				checkTransactionsBody(res.body.transactions);
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
