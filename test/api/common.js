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
	address: '8273455169423958419L',
	tx: '1465651642158264047',
	username: 'genesis_1',
};

describe('Common API', () => {
	/* Define functions for use within tests */
	const getVersion = (done) => {
		node.get('/api/version', done);
	};

	const getPriceTicker = (done) => {
		node.get('/api/getPriceTicker', done);
	};

	const getSearch = (id, done) => {
		node.get(`/api/search?id=${id}`, done);
	};

	/* Define api endpoints to test */
	describe('GET /api/version', () => {
		it('should be ok', (done) => {
			getVersion((err, res) => {
				node.expect(res.body).to.have.property('version');
				done();
			});
		});
	});

	describe('GET /api/getPriceTicker', () => {
		it('should be ok', (done) => {
			getPriceTicker((err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body).to.have.deep.property('tickers.LSK.BTC').to.be.at.least(0);
				node.expect(res.body).to.have.deep.property('tickers.LSK.EUR').to.be.at.least(0);
				node.expect(res.body).to.have.deep.property('tickers.LSK.USD').to.be.at.least(0);
				// node.expect(res.body).to.have.deep.property('tickers.LSK.CNY').to.be.at.least(0);
				node.expect(res.body).to.have.deep.property('tickers.BTC.USD').to.be.at.least(0);
				node.expect(res.body).to.have.deep.property('tickers.BTC.EUR').to.be.at.least(0);
				done();
			});
		});
	});


	describe('GET /api/search', () => {
		it('using known block should be ok', (done) => {
			getSearch(params.blockId, (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body.result.type).to.equal('block');
				node.expect(res.body.result.id).to.equal(params.blockId);
				done();
			});
		});

		it('using known height should be ok', (done) => {
			getSearch('1', (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body.result.type).to.equal('block');
				node.expect(res.body.result.id).to.equal(params.blockId);
				done();
			});
		});

		it('using known address should be ok', (done) => {
			getSearch(params.address, (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body.result.type).to.equal('address');
				node.expect(res.body.result.id).to.equal(params.address);
				done();
			});
		});

		it.skip('using known transaction should be ok', (done) => {
			getSearch(params.tx, (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body.result.type).to.equal('tx');
				node.expect(res.body.result.id).to.equal(params.tx);
				done();
			});
		});

		it('using known delegate should be ok', (done) => {
			getSearch(params.username, (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body.result.type).to.equal('delegate');
				node.expect(res.body.result.delegates[0].address).to.equal(params.address);
				done();
			});
		});

		it.skip('using partial known delegate should be ok', (done) => {
			getSearch('gene', (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body.result.type).to.equal('delegate');
				node.expect(res.body.result.delegates[0].address).to.equal(params.address);
				done();
			});
		});

		it('using no input should fail', (done) => {
			getSearch('', (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(false);
				node.expect(res.body).to.have.property('error').to.be.a('string');
				done();
			});
		});
	});
});
