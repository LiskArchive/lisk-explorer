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
const coreRequest = require('../../utils/core.js');
const request = require('request');
const _ = require('underscore');
const async = require('async');

module.exports = function (app) {
	const knowledge = app.knownAddresses;
	const param = (p, d) => {
		p = parseInt(p, 10);

		if (isNaN(p) || p < 0) {
			return d;
		}
		return p;
	};

	function Account() {
		this.validAddress = address =>
			(typeof address === 'string' && address.match(/^[0-9]{1,21}[L|l]$/g));

		this.validPublicKey = publicKey =>
			(typeof publicKey === 'string' && publicKey.match(/^([A-Fa-f0-9]{2}){32}$/g));

		this.getAccount = (address, cb) =>
			request.get({
				url: `${app.get('lisk address')}/api/accounts?address=${address}`,
				json: true,
			}, (err, response, body) => {
				if (err || response.statusCode !== 200) {
					return cb(err || 'Response was unsuccessful');
				} else if (body.success === true) {
					const account = body.account;
					account.knowledge = knowledge.inAccount(account);
					return cb(null, account);
				}
				return cb(body.error);
			});

		this.getAccountByPublicKey = (publicKey, cb) =>
			request.get({
				url: `${app.get('lisk address')}/api/accounts?publicKey=${publicKey}`,
				json: true,
			}, (err, response, body) => {
				if (err || response.statusCode !== 200) {
					return cb(err || 'Response was unsuccessful');
				} else if (body.success === true) {
					const account = body.account;
					account.knowledge = knowledge.inAccount(account);
					return cb(null, account);
				}
				return cb(body.error);
			});

		this.getDelegate = (account, cb) => {
			if (!account.publicKey) {
				return cb(null, account);
			}
			return request.get({
				url: `${app.get('lisk address')}/api/delegates/get?publicKey=${account.publicKey}`,
				json: true,
			}, (err, response, body) => {
				if (err || response.statusCode !== 200) {
					return cb(err || 'Response was unsuccessful');
				} else if (body.success === true) {
					account.delegate = body.delegate;
				} else {
					account.delegate = null;
				}
				return cb(null, account);
			});
		};

		this.getVotes = (account, cb) => {
			if (!account.address) {
				return cb(null, account);
			}
			return request.get({
				url: `${app.get('lisk address')}/api/accounts/delegates/?address=${account.address}`,
				json: true,
			}, (err, response, body) => {
				if (err || response.statusCode !== 200) {
					return cb(err || 'Response was unsuccessful');
				} else if (body.success === true) {
					account.votes = (body.delegates !== undefined &&
						body.delegates !== null && body.delegates.length > 0) ?
						body.delegates : null;
					_.each(account.votes, (d) => {
						d.knowledge = knowledge.inAccount(d);
					});
				} else {
					account.votes = null;
				}
				return cb(null, account);
			});
		};

		this.getVoters = (account, cb) => {
			if (!account.publicKey) {
				return cb(null, account);
			}
			return request.get({
				url: `${app.get('lisk address')}/api/delegates/voters?publicKey=${account.publicKey}`,
				json: true,
			}, (err, response, body) => {
				if (err || response.statusCode !== 200) {
					return cb(err || 'Response was unsuccessful');
				} else if (body.success === true) {
					account.voters = (body.accounts !== undefined &&
						body.accounts !== null && body.accounts.length > 0) ?
						body.accounts : null;
					_.each(account.voters, (d) => {
						d.knowledge = knowledge.inAccount(d);
					});
				} else {
					account.voters = null;
				}
				return cb(null, account);
			});
		};

		this.getIncomingTxsCnt = (account, cb) => {
			if (!account.address) {
				return cb(null, account);
			}

			return request.get({
				url: `${app.get('lisk address')}/api/transactions?recipientId=${account.address}&limit=1`,
				json: true,
			}, (err, response, body) => {
				if (err || response.statusCode !== 200) {
					return cb(err || 'Response was unsuccessful');
				} else if (body.success === true) {
					account.incoming_cnt = body.count;
				} else {
					account.incoming_cnt = 0;
				}
				return cb(null, account);
			});
		};

		this.getOutgoingTxsCnt = (account, cb) => {
			if (!account.address) {
				return cb(null, account);
			}

			return request.get({
				url: `${app.get('lisk address')}/api/transactions?senderId=${account.address}&limit=1`,
				json: true,
			}, (err, response, body) => {
				if (err || response.statusCode !== 200) {
					return cb(err || 'Response was unsuccessful');
				} else if (body.success === true) {
					account.outgoing_cnt = body.count;
				} else {
					account.outgoing_cnt = 0;
				}
				return cb(null, account);
			});
		};

		this.getForged = (account, cb) => {
			if (!account.delegate) {
				return cb(null, account);
			}
			return request.get({
				url: `${app.get('lisk address')}/api/delegates/forging/getForgedByAccount?generatorPublicKey=${account.publicKey}`,
				json: true,
			}, (err, response, body) => {
				if (err || response.statusCode !== 200) {
					return cb(err || 'Response was unsuccessful');
				} else if (body.success === true) {
					account.delegate.forged = body.forged;
				} else {
					account.delegate.forged = 0;
				}
				return cb(null, account);
			});
		};
	}

	this.getAccount = (params, error, success) => {
		const account = new Account();

		if (params.address && !account.validAddress(params.address)) {
			return error({ success: false, error: 'Missing/Invalid address parameter' });
		}

		if (params.publicKey && !account.validPublicKey(params.publicKey)) {
			return error({ success: false, error: 'Missing/Invalid publicKey parameter' });
		}

		return async.waterfall([
			(cb) => {
				if (params.address) {
					account.getAccount(params.address, cb);
				} else if (params.publicKey) {
					account.getAccountByPublicKey(params.publicKey, cb);
				} else {
					cb('Missing/Invalid address or publicKey parameter');
				}
			},
			(result, cb) => {
				account.getDelegate(result, cb);
			},
			(result, cb) => {
				account.getForged(result, cb);
			},
			(result, cb) => {
				account.getVotes(result, cb);
			},
			(result, cb) => {
				account.getVoters(result, cb);
			},
			(result, cb) => {
				account.getIncomingTxsCnt(result, cb);
			},
			(result, cb) => {
				account.getOutgoingTxsCnt(result, cb);
			},
		], (err, result) => {
			if (err) {
				return error({ success: false, error: err });
			}
			result.success = true;
			return success(result);
		});
	};

	function TopAccount() {
		const getDelegate = (account, cb) => {
			request.get({
				url: `${app.get('lisk address')}/api/delegates/get?publicKey=${account.publicKey}`,
				json: true,
			}, (err, response, body) => {
				if (err || response.statusCode !== 200) {
					return cb(err || 'Response was unsuccessful');
				} else if (body.success === true) {
					account.knowledge = knowledge.inDelegate(body.delegate);
				} else {
					account.knowledge = null;
				}
				return cb(null, account);
			});
		};

		this.getKnowledge = (account, cb) => {
			account.knowledge = knowledge.inAccount(account);

			if (!account.knowledge && account.publicKey) {
				return getDelegate(account, cb);
			}
			return cb(null, account);
		};
	}

	this.getTopAccounts = (query, error, success) => {
		const topAccount = new TopAccount();

		return coreRequest.get(`${app.get('lisk address')}/api/accounts/top?&offset=${param(query.offset, 0)}&limit=${param(query.limit, 100)}`)
			.then((body) => {
				if (Array.isArray(body.accounts)) {
					return async.forEach(body.accounts, (a, cb) => {
						topAccount.getKnowledge(a, cb);
					}, () => success({ success: true, accounts: body.accounts }));
				}
				return error({ success: false, status: 'SERVICE_UNAVAILABLE', error: body.error });
			}).catch((err) => {
				error({ success: false, error: err });
			});
	};
};
