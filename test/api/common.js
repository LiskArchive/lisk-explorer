const node = require('./../node.js');

const params = {
	blockId: '6524861224470851795',
	address: '8273455169423958419L',
	tx: '1465651642158264047',
	username: 'genesis_1',
};
const mockApiParams = {
	blockId: '6258354802676166000',
	address: '1631373966167063460L',
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

	describe.skip('GET /api/getPriceTicker', () => {
		it('should be ok', (done) => {
			getPriceTicker((err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body).to.have.deep.property('tickers.LSK.BTC').to.be.at.least(0);
				node.expect(res.body).to.have.deep.property('tickers.LSK.EUR').to.be.at.least(0);
				node.expect(res.body).to.have.deep.property('tickers.LSK.USD').to.be.at.least(0);
				node.expect(res.body).to.have.deep.property('tickers.LSK.CNY').to.be.at.least(0);
				node.expect(res.body).to.have.deep.property('tickers.BTC.USD').to.be.at.least(0);
				node.expect(res.body).to.have.deep.property('tickers.BTC.EUR').to.be.at.least(0);
				done();
			});
		});
	});


	describe('GET /api/search', () => {
		it('using known block should be ok', (done) => {
			// @todo use params instead of mockApiParams after changing to actual Lisk core Api
			getSearch(mockApiParams.blockId, (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body.type).to.equal('block');
				node.expect(res.body.id).to.equal(mockApiParams.blockId);
				done();
			});
		});

		it('using known height should be ok', (done) => {
			// @todo use params instead of mockApiParams after changing to actual Lisk core Api
			getSearch('1', (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body.type).to.equal('block');
				node.expect(res.body.id).to.equal(mockApiParams.blockId);
				done();
			});
		});

		it('using known address should be ok', (done) => {
			getSearch(params.address, (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body.type).to.equal('address');
				node.expect(res.body.id).to.equal(params.address);
				done();
			});
		});

		// @todo re-enable it after switching to actual Lisk Core Api
		// skipped since there's no way to differentiate between block and
		// transaction id
		it.skip('using known transaction should be ok', (done) => {
			getSearch(params.tx, (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body.type).to.equal('tx');
				node.expect(res.body.id).to.equal(params.tx);
				done();
			});
		});

		it('using known delegate should be ok', (done) => {
			getSearch(params.username, (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body.type).to.equal('address');
				// @todo use params instead of mockApiParams after changing to actual Lisk core Api
				node.expect(res.body.id).to.equal(mockApiParams.address);
				done();
			});
		});

		it('using partial known delegate should be ok', (done) => {
			getSearch('gene', (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body.type).to.equal('address');
				// @todo use params instead of mockApiParams after changing to actual Lisk core Api
				node.expect(res.body.id).to.equal(mockApiParams.address);
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
