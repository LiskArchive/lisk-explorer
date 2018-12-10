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
	address: '16313739661670634666L',
	address_delegate: '8273455169423958419L',
	address_lowercase: '16313739661670634666l',
	excessive_offset: '1000000',
	publicKey: 'c094ebee7ec0c50ebee32918655e089f6e1a604b83bcaa760293c61e0f18ab6f',
	pkWithVotes: 'c094ebee7ec0c50ebee32918655e089f6e1a604b83bcaa760293c61e0f18ab6f',
	pkWithVoters: '904c294899819cce0283d8d351cb10febfa0e9f0acd90a820ec8eb90a7084c37',
};

describe('Accounts API', () => {
	/* Define functions for use within tests */
	function getAccount(id, done) {
		node.get(`/api/getAccount?address=${id}`, done);
	}

	function getAccountByPublicKey(pk, done) {
		node.get(`/api/getAccount?publicKey=${pk}`, done);
	}

	function getTopAccounts(id, id2, done) {
		node.get(`/api/getTopAccounts?offset=${id}&limit=${id2}`, done);
	}

	function getVotes(pk, done) {
		node.get(`/api/getVotes?publicKey=${pk}`, done);
	}

	function getVoters(pk, done) {
		node.get(`/api/getVoters?publicKey=${pk}`, done);
	}

	function checkAccountTypes(o) {
		node.expect(o.success).to.be.a('boolean');
		node.expect(o.multisignatures).to.be.an('array');
		node.expect(o.multisignatureAccount).to.be.an('object');
		node.expect(o.multisignatureMemberships).to.be.an('array');
		node.expect(o.secondPublicKey).to.be.a('string');
		node.expect(o.secondSignature).to.be.a('boolean');
		node.expect(o.unconfirmedSignature).to.be.a('number');
		node.expect(o.publicKey).to.be.a('string');
		node.expect(o.balance).to.be.a('string');
		node.expect(o.unconfirmedBalance).to.be.a('string');
		node.expect(o.address).to.be.a('string');
		node.expect(o.u_multisignatures).to.be.an('array');
		node.expect(o.knowledge).to.satisfy(knowledge => !knowledge || typeof knowledge === 'object');
		node.expect(o.delegate).to.satisfy(delegate => delegate === null || typeof delegate === 'object');
		node.expect(o.incoming_cnt).to.be.a('string');
		node.expect(o.outgoing_cnt).to.be.a('string');
	}

	function checkAccount(o) {
		node.expect(o).to.have.all.keys(
			'success',
			'multisignatures',
			'multisignatureAccount',
			'multisignatureMemberships',
			'secondPublicKey',
			'secondSignature',
			'unconfirmedSignature',
			'publicKey',
			'balance',
			'unconfirmedBalance',
			'address',
			'u_multisignatures',
			'knowledge',
			'delegate',
			'incoming_cnt',
			'outgoing_cnt');

		checkAccountTypes(o);
	}

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
		node.expect(o.forged).to.be.a('string');
	}

	const checkDelegate = (o) => {
		node.expect(o).to.contain.all.keys(
			'address',
			'approval',
			'missedblocks',
			'producedblocks',
			'productivity',
			'publicKey',
			'rate',
			'username',
			'vote',
			'forged');

		checkDelegateTypes(o);
	};

	function checkTopAccountTypes(o) {
		node.expect(o.address).to.be.a('string');
		node.expect(o.balance).to.be.a('string');
		node.expect(o.publicKey).to.be.a('string');
		node.expect(o.knowledge).to.satisfy(knowledge => !knowledge || typeof knowledge === 'object');
	}

	const checkTopAccount = (o) => {
		node.expect(o).to.have.all.keys(
			'address',
			'balance',
			'publicKey',
			'knowledge');

		checkTopAccountTypes(o);
	};

	const checkTopAccounts = (id) => {
		for (let i = 0; i < id.length; i++) {
			checkTopAccount(id[i]);
		}
	};

	/* Define api endpoints to test */
	describe('GET /api/getAccount', () => {
		it('using known address should be ok', (done) => {
			getAccount(params.address, (err, res) => {
				node.expect(res.body).to.have.property('success').to.not.be.equal(undefined);
				checkAccount(res.body);
				done();
			});
		});

		it('using delgate address should return delegate data', (done) => {
			getAccount(params.address_delegate, (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				checkAccount(res.body);
				checkDelegate(res.body.delegate);
				done();
			});
		});

		it('using invalid address should fail', (done) => {
			getAccount('L', (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(false);
				node.expect(res.body).to.have.property('error');
				done();
			});
		});

		it('using unknown address should fail', (done) => {
			getAccount('999999999L', (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(false);
				node.expect(res.body).to.have.property('error');
				done();
			});
		});

		it('using known lowercase address should be ok', (done) => {
			getAccount(params.address_lowercase, (err, res) => {
				node.expect(res.body).to.have.property('success').to.not.be.equal(undefined);
				checkAccount(res.body);
				done();
			});
		});

		it('using no address should fail', (done) => {
			getAccount('', (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(false);
				node.expect(res.body).to.have.property('error');
				done();
			});
		});

		it('using known pk should be ok', (done) => {
			getAccountByPublicKey(params.publicKey, (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				checkAccount(res.body);
				done();
			});
		});

		it('using invalid pk should fail', (done) => {
			getAccountByPublicKey('invalid_pk', (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.not.equal(true);
				node.expect(res.body).to.have.property('error');
				done();
			});
		});

		it('using unknown pk should fail', (done) => {
			getAccountByPublicKey('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(false);
				node.expect(res.body).to.have.property('error');
				done();
			});
		});

		it('using no pk should fail', (done) => {
			getAccountByPublicKey('', (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(false);
				node.expect(res.body).to.have.property('error');
				done();
			});
		});

		it('using address with 101 votes should return all 101 votes', (done) => {
			getVotes(params.pkWithVotes, (err, res) => {
				node.expect(res.body).to.have.property('success').to.not.be.equal(undefined);
				node.expect(res.body.votes).to.have.lengthOf(101);
				node.expect(res.body).to.have.all.keys('success', 'meta', 'votes');
				done();
			});
		});

		it('using delegate with 2 voters should return 2 voters', (done) => {
			getVoters(params.pkWithVoters, (err, res) => {
				node.expect(res.body).to.have.property('success').to.not.be.equal(undefined);
				node.expect(res.body.voters).to.have.lengthOf(2);
				node.expect(res.body).to.have.all.keys('success', 'meta', 'voters');
				done();
			});
		});
	});

	/* -- if all fail, check lisk for topAccounts = true */
	describe('GET /api/getTopAccounts', () => {
		it('using offset 0 and limit 100 should return 100', (done) => {
			getTopAccounts('0', '100', (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body.accounts.length).to.equal(100);
				checkTopAccounts(res.body.accounts);
				done();
			});
		});

		it('using offset 0 and limit 1 should return 1', (done) => {
			getTopAccounts('0', '1', (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body.accounts.length).to.equal(1);
				checkTopAccounts(res.body.accounts);
				done();
			});
		});

		it('using offset 100 and limit 50 should return 50', (done) => {
			getTopAccounts('100', '50', (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body.accounts.length).to.equal(50);
				checkTopAccounts(res.body.accounts);
				done();
			});
		});

		it('using offset 0 and limit 0 should return 100', (done) => {
			getTopAccounts('0', '0', (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body.accounts.length).to.equal(100);
				checkTopAccounts(res.body.accounts);
				done();
			});
		});

		it('using offset 0 and limit -1 and return 100', (done) => {
			getTopAccounts('0', '-1', (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body.accounts.length).to.equal(100);
				checkTopAccounts(res.body.accounts);
				done();
			});
		});

		it('using offset 100000 and no limit should return 0', (done) => {
			getTopAccounts(params.excessive_offset, '', (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body.accounts.length).to.equal(0);
				done();
			});
		});

		it('unknown addresses should NOT have owner property', (done) => {
			getTopAccounts('0', '1', (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body.accounts[0]).to.have.property('knowledge').to.be.equal(null);
				done();
			});
		});

		it('delegate addresses should have owner property', (done) => {
			getTopAccounts('1', '1', (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body.accounts[0]).to.have.property('knowledge');
				node.expect(res.body.accounts[0].knowledge).to.have.property('owner');
				done();
			});
		});

		it('known addresses should have owner and description property', (done) => {
			getTopAccounts('2', '1', (err, res) => {
				node.expect(res.body).to.have.property('success').to.be.equal(true);
				node.expect(res.body.accounts[0]).to.have.property('knowledge');
				node.expect(res.body.accounts[0].knowledge).to.have.property('owner');
				node.expect(res.body.accounts[0].knowledge).to.have.property('description');
				done();
			});
		});
	});
});
