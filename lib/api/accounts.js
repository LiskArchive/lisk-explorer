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

	/**
	 * Renamed some of the account properties to temporarily match the old Api responses
	 *
	 * @todo remove this with #285
	 */
	const rollbackProperties = (account) => {
		if (account.delegate) {
			account.delegate.forged = account.delegate.rewards;
		}
		account.multisignatures = account.multisignatureMaster;
		delete account.multisignatureMaster;
		delete account.multisignatureMember;
		return account;
	};

	function Account() {
		this.validAddress = address =>
			(typeof address === 'string' && address.match(/^[0-9]{1,21}[L|l]$/g));

		this.validPublicKey = publicKey =>
			(typeof publicKey === 'string' && publicKey.match(/^([A-Fa-f0-9]{2}){32}$/g));

		this.getAccount = (address, cb) =>
			request.get({
				url: `${app.get('lisk address')}/accounts?address=${address}`,
				json: true,
			}, (err, response, body) => {
				if (err || response.statusCode !== 200) {
					return cb(null, err || { error: 'Account not found' });
				}
				body[0].knowledge = knowledge.inAccount(body[0]);
				body[0] = rollbackProperties(body[0]);
				return cb(null, body);
			});

		this.getAccountByPublicKey = (publicKey, cb) =>
			request.get({
				url: `${app.get('lisk address')}/accounts?publicKey=${publicKey}`,
				json: true,
			}, (err, response, body) => {
				if (err || response.statusCode !== 200) {
					return cb(err || { error: 'Response was unsuccessful' });
				}
				let account = body.accounts[0];
				account.knowledge = knowledge.inAccount(account);
				account = rollbackProperties(account);
				return cb(null, account);
			});

		this.getDelegate = (account, cb) => {
			if (!account || !account.publicKey) {
				return cb(null, account);
			}

			return request.get({
				url: `${app.get('lisk address')}/delegates?publicKey=${account.publicKey}`,
				json: true,
			}, (err, response, body) => {
				if (response.statusCode === 200) {
					account.delegate = body.delegates[0];
				} else if (response.statusCode === 204) {
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
				url: `${app.get('lisk address')}/votes/?publicKey=${account.publicKey}`,
				json: true,
			}, (err, response, body) => {
				if (response.statusCode === 200) {
					account.votes = (body.delegates !== undefined &&
						body.delegates !== null && body.delegates.length > 0) ?
						body.delegates : null;
					_.each(account.votes, (d) => {
						d.knowledge = knowledge.inAccount(d);
					});
				} else if (response.statusCode === 204) {
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
				url: `${app.get('lisk address')}/voters?publicKey=${account.publicKey}`,
				json: true,
			}, (err, response, body) => {
				if (response.statusCode === 200) {
					account.voters = (body.accounts !== undefined &&
						body.accounts !== null && body.accounts.length > 0) ?
						body.accounts : null;
					_.each(account.voters, (d) => {
						d.knowledge = knowledge.inAccount(d);
					});
				} else if (response.statusCode === 204) {
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
				url: `${app.get('lisk address')}/transactions?recipientId=${account.address}&limit=1`,
				json: true,
			}, (err, response, body) => {
				if (response.statusCode === 200) {
					account.incoming_cnt = body.count;
					account.secondSignature = body.transactions[0].secondSignature || null;
				} else if (response.statusCode === 204) {
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
				url: `${app.get('lisk address')}/transactions?senderId=${account.address}&limit=1`,
				json: true,
			}, (err, response, body) => {
				if (response.statusCode === 200) {
					account.outgoing_cnt = body.count;
					if (!account.secondSignature) {
						account.secondSignature = body.transactions[0].secondSignature || null;
					}
				} else if (response.statusCode === 204) {
					account.outgoing_cnt = 0;
				}
				return cb(null, account);
			});
		};

		// The new Account endpoint returns rewards instead
		this.getForged = (account, cb) => {
			if (!account.delegate) {
				return cb(null, account);
			}
			return request.get({
				url: `${app.get('lisk address')}/delegates/forging/getForgedByAccount?generatorPublicKey=${account.publicKey}`,
				json: true,
			}, (err, response, body) => {
				if (response.statusCode === 200) {
					account.delegate.forged = body.forged;
				} else if (response.statusCode === 204) {
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

		if (!params.address && !params.publicKey) {
			return error({ success: false, error: 'Missing/Invalid publicKey parameter' });
		}
		return async.waterfall([
			(cb) => {
				if (params.address) {
					account.getAccount(params.address, cb);
				} else {
					account.getAccountByPublicKey(params.publicKey, cb);
				}
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
				url: `${app.get('lisk address')}/delegates/get?publicKey=${account.publicKey}`,
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

		return request.get({
			url: `${app.get('lisk address')}/accounts/top?&offset=${param(query.offset, 0)}&limit=${param(query.limit, 100)}`,
			json: true,
		}, (err, response, body) => {
			if (err || response.statusCode !== 200) {
				return error({ success: false, error: (err || 'Response was unsuccessful') });
			} else if (body.success === true) {
				return async.forEach(body.accounts, (a, cb) => {
					topAccount.getKnowledge(a, cb);
				}, () => success({ success: true, accounts: body.accounts }));
			}
			return error({ success: false, error: body.error });
		});
	};
};
