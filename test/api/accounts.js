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

describe.skip('Accounts API', () => {
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
	});
});
