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

/* expecting testnet genesis block for tests */
const params = {
	height: 1,
	id: '6524861224470851795',
	id2: '8757390707158788492',
	generatorPublicKey: 'c96dec3595ff6041c3bd28b76b8cf75dce8225173d1bd00241624ee89b50f2a8',
	totalAmount: 100000000,
	totalFee: 0,
};

describe('Blocks API', () => {
	/* Define functions for use within tests */
	const getLastBlocks = (id, done) => {
		node.get(`/api/getLastBlocks?n=${id}`, done);
	};

	const getBlockStatus = (done) => {
		node.get('/api/getBlockStatus', done);
	};

	const getBlock = (id, done) => {
		node.get(`/api/getBlock?blockId=${id}`, done);
	};

	const getHeight = (id, done) => {
		node.get(`/api/getHeight?height=${id}`, done);
	};

	const checkPagination = (id) => {
		node.expect(id).to.have.property('currentPage');

		if (id.before) {
			node.expect(id).to.have.property('previousPage');
			node.expect(id.currentPage).to.gt(id.previousPage);
		}

		if (id.more) {
			node.expect(id).to.have.property('nextPage');
			node.expect(id.nextPage).to.gt(id.currentPage);
		}
	};

	function checkLastBlockTypes(o) {
		node.expect(o.delegate).to.be.an('object');
		node.expect(o.generator).to.be.a('string');
		node.expect(o.reward).to.be.a('number');
		node.expect(o.id).to.be.a('string');
		node.expect(o.timestamp).to.be.a('number');
		node.expect(o.height).to.be.a('number');
		node.expect(o.transactionsCount).to.be.a('number');
		node.expect(o.totalAmount).to.be.a('number');
		node.expect(o.totalFee).to.be.a('number');
		node.expect(o.totalForged).to.be.a('string');
	}

	const checkLastBlock = (o) => {
		node.expect(o).to.contain.all.keys(
			'delegate',
			'generator',
			'reward',
			'id',
			'timestamp',
			'height',
			'transactionsCount',
			'totalAmount',
			'totalFee',
			'totalForged');

		checkLastBlockTypes(o);
	};

	function checkDelegateTypes(o) {
		node.expect(o.address).to.be.a('string');
		node.expect(o.approval).to.be.a('number');
		node.expect(o.missedblocks).to.be.a('number');
		node.expect(o.producedblocks).to.be.a('number');
		node.expect(o.productivity).to.be.a('number');
		node.expect(o.publicKey).to.be.a('string');
		node.expect(o.rate).to.be.a('number');
		node.expect(o.username).to.be.a('string');
		node.expect(o.vote).to.be.a('string');
	}

	const checkDelegate = (o) => {
		node.expect(o).to.contain.all.keys(
			'productivity',
			'username',
			'address',
			'publicKey',
			'vote',
			'producedblocks',
			'missedblocks',
			'rate',
			'approval');

		checkDelegateTypes(o);
	};

	const checkLastBlocks = (blocks) => {
		blocks.forEach((block) => {
			checkLastBlock(block);
			checkDelegate(block.delegate);
		});
	};

	function checkBlockTypes(o) {
		const delegateType = o.height === 1 ? 'null' : 'object';
		node.expect(o.delegate).to.be.an(delegateType);
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
			'delegate',
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

	/* Define api endpoints to test */
	describe('GET /api/getLastBlocks', () => {
		it('should be ok', (done) => {
			getLastBlocks('0', (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body).to.have.property('blocks').to.be.an('array');
				node.expect(res.body.blocks.length).to.equal(20);
				node.expect(res.body).to.have.property('pagination');
				checkLastBlocks(res.body.blocks);
				checkPagination(res.body.pagination);
				done();
			});
		});

		it('using offset of 20 should be ok', (done) => {
			getLastBlocks('20', (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body).to.have.property('blocks').to.be.an('array');
				node.expect(res.body).to.have.property('pagination');
				node.expect(res.body.blocks.length).to.equal(20);
				checkLastBlocks(res.body.blocks);
				checkPagination(res.body.pagination);
				done();
			});
		});
	});

	describe('GET /api/getBlockStatus', () => {
		it('should be ok', (done) => {
			getBlockStatus((err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body).to.have.property('broadhash').to.be.a('string');
				node.expect(res.body).to.have.property('epoch').to.be.a('string');
				node.expect(res.body).to.have.property('height').to.be.a('number');
				node.expect(res.body).to.have.property('fee').to.be.a('number');
				node.expect(res.body).to.have.property('milestone').to.be.a('number');
				node.expect(res.body).to.have.property('nethash').to.be.a('string');
				node.expect(res.body).to.have.property('reward').to.be.a('number');
				node.expect(res.body).to.have.property('supply').to.be.a('number');
				done();
			});
		});
	});

	describe('GET /api/getBlock', () => {
		it('using known blockId should be ok', (done) => {
			getBlock(params.id, (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body).to.have.property('block').to.be.a('object');
				node.expect(res.body.block.delegate).to.be.equal(null);
				checkBlock(res.body.block);
				done();
			});
		});

		it('using known blockId @ Height 2 should be ok', (done) => {
			getBlock(params.id2, (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body).to.have.property('block').to.be.a('object');
				checkBlock(res.body.block);
				checkDelegate(res.body.block.delegate);
				done();
			});
		});


		it('using unknown blockId should fail', (done) => {
			getBlock('9928719876370886655', (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(false);
				node.expect(res.body).to.have.property('error').to.be.a('string');
				done();
			});
		});

		it('using no blockId should fail', (done) => {
			getBlock('', (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(false);
				node.expect(res.body).to.have.property('error').to.be.a('string');
				done();
			});
		});
	});

	describe('GET /api/getHeight', () => {
		it('using known height be ok', (done) => {
			getHeight(params.height, (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body).to.have.property('block').to.be.a('object');
				node.expect(res.body.block.id).to.equal(params.id);
				done();
			});
		});

		it('using invalid height should fail', (done) => {
			getHeight('-1', (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(false);
				node.expect(res.body).to.have.property('error').to.be.a('string');
				done();
			});
		});

		it('using no height should fail', (done) => {
			getHeight('', (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(false);
				node.expect(res.body).to.have.property('error').to.be.a('string');
				done();
			});
		});
	});
});
