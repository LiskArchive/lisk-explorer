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
	excessive_offset: '1000000',
	publicKey: 'c094ebee7ec0c50ebee32918655e089f6e1a604b83bcaa760293c61e0f18ab6f',
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

	function checkAccount(id) {
		node.expect(id).to.have.all.keys(
			'success',
			'multisignatures',
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
			'votes',
			'voters',
			'incoming_cnt',
			'outgoing_cnt');
	}

	const checkDelegate = (id) => {
		node.expect(id).to.contain.all.keys(
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
	};

	const checkTopAccount = (id) => {
		node.expect(id).to.have.all.keys(
			'address',
			'balance',
			'publicKey',
			'knowledge');
	};

	const checkTopAccounts = (id) => {
		for (let i = 0; i < id.length; i++) {
			if (id[i + 1]) {
				checkTopAccount(id[i]);
			}
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

		it('using delegate with 2 voters should return 2 voters', (done) => {
			getAccount(params.address_delegate, (err, res) => {
				node.expect(res.body).to.have.property('success').to.not.be.equal(undefined);
				checkAccount(res.body);
				node.expect(res.body.voters.length).to.be.equal(2);
        done();
			});
		});

		it('using address with 101 votes should return all 101 votes', (done) => {
			getAccount(params.address, (err, res) => {
				node.expect(res.body).to.have.property('success').to.not.be.equal(undefined);
				checkAccount(res.body);
				node.expect(res.body.votes.length).to.be.equal(101);
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
