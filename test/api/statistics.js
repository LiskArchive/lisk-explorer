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

describe('Statistics API', () => {
	/* Define functions for use within tests */
	function getLastBlock(done) {
		node.get('/api/statistics/getLastBlock', done);
	}

	function getBlocks(done) {
		node.get('/api/statistics/getBlocks', done);
	}

	function getPeers(done) {
		node.get('/api/statistics/getPeers', done);
	}

	function checkPeerTypes(o) {
		node.expect(o.ip).to.be.a('string');
		node.expect(o.httpPort).to.satisfy(httpPort => typeof httpPort === 'number' || httpPort === 'n/a');
		node.expect(o.wsPort).to.satisfy(wsPort => typeof wsPort === 'number' || wsPort === 'n/a');
		node.expect(o.state).to.be.a('number');
		node.expect(o.os).to.satisfy(os => !os || typeof os === 'string');
		node.expect(o.version).to.be.a('string');
		node.expect(o.broadhash).to.satisfy(broadhash => !broadhash || typeof broadhash === 'string');
		node.expect(o.height).to.satisfy(height => !height || typeof height === 'number');
		node.expect(o.osBrand).to.be.a('object');
		node.expect(o.humanState).to.be.a('string');
		node.expect(o.location).to.satisfy(location => !location || typeof location === 'object');
	}

	function checkPeer(o) {
		checkPeerTypes(o);
	}

	function checkPeersList(list) {
		for (let i = 0; i < list.length; i++) {
			checkPeer(list[i]);
		}
	}

	function checkBlockTypes(o) {
		node.expect(o.totalForged).to.be.a('string');
		node.expect(o.confirmations).to.be.a('number');
		node.expect(o.blockSignature).to.be.a('string');
		node.expect(o.generatorId).to.be.a('string');
		node.expect(o.generatorPublicKey).to.be.a('string');
		node.expect(o.payloadHash).to.be.a('string');
		node.expect(o.payloadLength).to.be.a('number');
		node.expect(o.reward).to.be.a('number');
		node.expect(o.id).to.be.a('string');
		node.expect(o.version).to.be.a('number');
		node.expect(o.timestamp).to.be.a('number');
		node.expect(o.height).to.be.a('number');
		node.expect(o.previousBlock).to.be.a('string');
		node.expect(o.numberOfTransactions).to.be.a('number');
		node.expect(o.totalAmount).to.be.a('number');
		node.expect(o.totalFee).to.be.a('number');
	}

	const checkBlock = (o) => {
		node.expect(o).to.have.all.keys(
			'totalForged',
			'confirmations',
			'blockSignature',
			'generatorId',
			'generatorPublicKey',
			'payloadHash',
			'payloadLength',
			'reward',
			'id',
			'version',
			'timestamp',
			'height',
			'previousBlock',
			'numberOfTransactions',
			'totalAmount',
			'totalFee');

		checkBlockTypes(o);
	};

	function hasDuplicates(array) {
		return (new Set(array.map(o => o.ip))).size !== array.length;
	}

	/* Define api endpoints to test */
	describe('GET /api/statistics/getLastBlock', () => {
		it('should be ok', (done) => {
			getLastBlock((err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body).to.have.property('block');
				checkBlock(res.body.block);
				done();
			});
		});
	});

	describe('GET /api/statistics/getBlocks', () => {
		it('should be ok', (done) => {
			getBlocks((err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body).to.have.property('volume');
				node.expect(res.body.volume).to.have.property('end');
				node.expect(res.body.volume).to.have.property('beginning');
				node.expect(res.body.volume).to.have.property('withTxs');
				node.expect(res.body.volume).to.have.property('txs');
				node.expect(res.body.volume).to.have.property('blocks');
				node.expect(res.body.volume).to.have.property('amount');
				node.expect(res.body).to.have.property('best');
				checkBlock(res.body.best);
				done();
			});
		});
	});

	describe('GET /api/statistics/getPeers', () => {
		it('should be ok', (done) => {
			getPeers((err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body).to.have.property('list');
				checkPeersList(res.body.list.connected);
				checkPeersList(res.body.list.disconnected);
				done();
			});
		});

		it('should not contain duplicated IPs', (done) => {
			getPeers((err, res) => {
				node.expect(hasDuplicates(res.body.list.connected)).to.be.equal(false);
				done();
			});
		});
	});
});
