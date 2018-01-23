const node = require('./../node.js');

describe('Exchanges API (Market Watcher)', () => {
	/* Define functions for use within tests */
	function getExchanges(done) {
		node.get('/api/exchanges', done);
	}

	function getCandles(e, d, done) {
		node.get(`/api/exchanges/getCandles?e=${e}&d=${d}`, done);
	}

	function getStatistics(e, done) {
		node.get(`/api/exchanges/getStatistics?e=${e}`, done);
	}

	function checkCandles(id) {
		for (let i = 0; i < id.length; i++) {
			if (id[i + 1]) {
				node.expect(id[i]).to.contain.all.keys(
					'timestamp',
					'date',
					'high',
					'low',
					'open',
					'close',
					'liskVolume',
					'btcVolume');
			}
		}
	}

	function getOrders(id, done) {
		node.get(`/api/exchanges/getOrders?e=${id}`, done);
	}

	function checkOrders(id) {
		for (let i = 0; i < id.length; i++) {
			if (id[i + 1]) {
				node.expect(id[i]).to.have.all.keys(
					'ask',
					'bid',
					'price',
					'amount');
			}
		}
	}

	function checkValues(id) {
		for (let i = 0; i < id.length; i++) {
			if (id[i + 1]) {
				node.expect(typeof id[i][0]).to.be.equal('number');
				node.expect(typeof id[i][1]).to.be.equal('number');
			}
		}
	}

	/* Define api endpoints to test */
	describe('GET /api/exchanges', () => {
		it('should be ok', (done) => {
			getExchanges((err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body).to.have.property('enabled').to.be.equal(true);
				node.expect(res.body).to.have.deep.property('exchanges.poloniex').to.be.equal(true);
				node.expect(res.body).to.have.deep.property('exchanges.bittrex').to.be.equal(true);
				done();
			});
		});
	});

	describe('GET /api/exchanges/getCandles', () => {
		it('using no inputs should fail', (done) => {
			getCandles('', '', (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(false);
				node.expect(res.body).to.have.property('error');
				done();
			});
		});

		it('using bittrex should be ok', (done) => {
			getCandles('bittrex', '', (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body).to.have.property('exchange').to.be.equal('bittrex');
				checkCandles(res.body.candles);
				done();
			});
		});

		it('using poloniex should be ok', (done) => {
			getCandles('poloniex', '', (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body).to.have.property('exchange').to.be.equal('poloniex');
				checkCandles(res.body.candles);
				done();
			});
		});

		it('using unknown_exchange should not be ok', (done) => {
			getCandles('unknown_exchange', '', (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(false);
				node.expect(res.body).to.have.property('error');
				done();
			});
		});

		it('using minute for bittrex should be ok and return timeframe minute', (done) => {
			getCandles('bittrex', 'minute', (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body).to.have.property('timeframe').to.be.equal('minute');
				node.expect(res.body).to.have.property('exchange').to.be.equal('bittrex');
				checkCandles(res.body.candles);
				done();
			});
		});

		it('using hour for bittrex should be ok and return timeframe hour', (done) => {
			getCandles('bittrex', 'hour', (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body).to.have.property('timeframe').to.be.equal('hour');
				node.expect(res.body).to.have.property('exchange').to.be.equal('bittrex');
				checkCandles(res.body.candles);
				done();
			});
		});

		it('using day for bittrex should be ok and return timeframe day', (done) => {
			getCandles('bittrex', 'day', (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body).to.have.property('timeframe').to.be.equal('day');
				node.expect(res.body).to.have.property('exchange').to.be.equal('bittrex');
				checkCandles(res.body.candles);
				done();
			});
		});

		it('using minute for poloniex should be ok and return timeframe minute', (done) => {
			getCandles('poloniex', 'minute', (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body).to.have.property('timeframe').to.be.equal('minute');
				node.expect(res.body).to.have.property('exchange').to.be.equal('poloniex');
				checkCandles(res.body.candles);
				done();
			});
		});

		it('using hour for poloniex should be ok and return timeframe hour', (done) => {
			getCandles('poloniex', 'hour', (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body).to.have.property('timeframe').to.be.equal('hour');
				node.expect(res.body).to.have.property('exchange').to.be.equal('poloniex');
				checkCandles(res.body.candles);
				done();
			});
		});

		it('using day for poloniex should be ok and return timeframe day', (done) => {
			getCandles('poloniex', 'day', (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body).to.have.property('timeframe').to.be.equal('day');
				node.expect(res.body).to.have.property('exchange').to.be.equal('poloniex');
				checkCandles(res.body.candles);
				done();
			});
		});
	});

	describe('GET /api/exchanges/getOrders', () => {
		it('using bittrex should be ok', (done) => {
			getOrders('bittrex', (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body).to.have.property('orders');
				checkOrders(res.body.orders.depth);
				checkValues(res.body.orders.asks);
				checkValues(res.body.orders.bids);
				done();
			});
		});

		it('using poloniex should be ok', (done) => {
			getOrders('poloniex', (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body).to.have.property('orders');
				checkOrders(res.body.orders.depth);
				checkValues(res.body.orders.asks);
				checkValues(res.body.orders.bids);
				done();
			});
		});

		it('using no input should fail', (done) => {
			getOrders('', (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(false);
				node.expect(res.body).to.have.property('error');
				done();
			});
		});

		it('using unknown_exchange should fail', (done) => {
			getOrders('unknown_exchange', (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(false);
				node.expect(res.body).to.have.property('error');
				done();
			});
		});
	});

	describe('GET /api/exchanges/getStatistics', () => {
		it('using no input should fail', (done) => {
			getStatistics('', (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(false);
				node.expect(res.body).to.have.property('error');
				done();
			});
		});

		it('using bittrex should be ok', (done) => {
			getStatistics('bittrex', (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body).to.have.property('exchange').to.be.equal('bittrex');
				done();
			});
		});

		it('using poloniex should be ok', (done) => {
			getStatistics('poloniex', (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body).to.have.property('exchange').to.be.equal('poloniex');
				done();
			});
		});

		it('using unknown_exchange should not be ok', (done) => {
			getStatistics('unknown_exchange', (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(false);
				node.expect(res.body).to.have.property('error');
				done();
			});
		});
	});
});
