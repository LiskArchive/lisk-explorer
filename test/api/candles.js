'use strict'; /*jslint mocha:true, expr:true */


var node = require('./../node.js');

describe('Candles API', function() {

    /*Define functions for use within tests*/
    function getCandles(e, d, done) {
        node.get('/api/candles/getCandles?e=' + e + '&d=' + d, done);
    }

    function getStatistics(e, done) {
        node.get('/api/candles/getStatistics?e=' + e, done);
    }

    function checkCandles(id) {
        for (var i = 0; i < id.length; i++) {
            if (id[i + 1]) {
                node.expect(id[i]).to.have.all.keys(
                    'timestamp',
                    'date',
                    'high',
                    'low',
                    'open',
                    'close',
                    'liskVolume',
                    'btcVolume',
                    'firstTrade',
                    'lastTrade',
                    'nextStart',
                    'numTrades'
                );
            }
        }
    }

    /*Define api endpoints to test */
    describe('GET /api/candles/getCandles', function() {

        it('using no inputs should be ok', function(done) {
            getCandles('', '', function(err, res) {
                node.expect(res.body).to.have.property('success').to.be.ok;
                node.expect(res.body).to.have.property('exchange');
                checkCandles(res.body.candles);
                done();
            });
        });

        it('using poloniex should be ok', function(done) {
            getCandles('poloniex', '', function(err, res) {
                node.expect(res.body).to.have.property('success').to.be.ok;
                node.expect(res.body).to.have.property('exchange').to.be.equal('poloniex');
                checkCandles(res.body.candles);
                done();
            });
        });

        it('using unknown_exchange should not be ok', function(done) {
            getCandles('unknown_exchange', '', function(err, res) {
                node.expect(res.body).to.have.property('success').to.be.not.ok;
                node.expect(res.body).to.have.property('error');
                done();
            });
        });

        it('using minute should be ok and return timeframe minute', function(done) {
            getCandles('', 'minute', function(err, res) {
                node.expect(res.body).to.have.property('success').to.be.ok;
                node.expect(res.body).to.have.property('timeframe').to.be.equal('minute');
                checkCandles(res.body.candles);
                done();
            });
        });

        it('using hour should be ok and return timeframe hour', function(done) {
            getCandles('', 'hour', function(err, res) {
                node.expect(res.body).to.have.property('success').to.be.ok;
                node.expect(res.body).to.have.property('timeframe').to.be.equal('hour');
                node.expect(res.body).to.have.property('exchange');
                checkCandles(res.body.candles);
                done();
            });
        });

        it('using day should be ok and return timeframe day', function(done) {
            getCandles('', 'day', function(err, res) {
                node.expect(res.body).to.have.property('success').to.be.ok;
                node.expect(res.body).to.have.property('timeframe').to.be.equal('day');
                node.expect(res.body).to.have.property('exchange');
                checkCandles(res.body.candles);
                done();
            });
        });
    });

    /* -- if all fail, check lisk for topAccounts = true */
    describe('GET /api/candles/getStatistics', function() {

        it('using no input should be ok', function(done) {
            getStatistics('', function(err, res) {
                node.expect(res.body).to.have.property('success').to.be.ok;
                node.expect(res.body).to.have.property('exchange');
                done();
            });
        });

        it('using poloniex should be ok', function(done) {
            getStatistics('poloniex', function(err, res) {
                node.expect(res.body).to.have.property('success').to.be.ok;
                node.expect(res.body).to.have.property('exchange').to.be.equal('poloniex');
                done();
            });
        });

        it('using unknown_exchange should not be ok', function(done) {
            getStatistics('unknown_exchange', function(err, res) {
                node.expect(res.body).to.have.property('success').to.be.not.ok;
                node.expect(res.body).to.have.property('error');
                done();
            });
        });
    });
});
