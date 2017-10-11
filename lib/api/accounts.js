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

		this.getAccount = (key, value, cb) => {
			const normalizedKey = key === 'address' ? key : 'publicKey';
			return request.get({
				url: `${app.get('lisk address')}/accounts?${normalizedKey}=${value}`,
				json: true,
			}, (err, response) => {
				if (response.statusCode !== 200) {
					return cb(null, err || { error: 'Account not found' });
				}

				response.body.accounts[0].knowledge = knowledge.inAccount(response.body.accounts[0]);
				response.body.accounts[0] = rollbackProperties(response.body.accounts[0]);
				return cb(null, response.body);
			});
		};

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

		this.getVotes = (result, cb) => {
			if (!result.accounts || result.accounts.length === 0) {
				return cb(null, result);
			}

			return request.get({
				url: `${app.get('lisk address')}/votes/?publicKey=${result.accounts[0].publicKey}`,
				json: true,
			}, (err, response, body) => {
				if (response.statusCode === 200) {
					result.accounts[0].votes = (body.delegates !== undefined &&
						body.delegates !== null && body.delegates.length > 0) ?
						body.delegates : null;
					_.each(result.accounts[0].votes, (d) => {
						d.knowledge = knowledge.inAccount(d);
					});
				} else if (response.statusCode === 204) {
					result.accounts[0].votes = null;
				}
				return cb(null, result);
			});
		};

		this.getVoters = (result, cb) => {
			if (!result.accounts || result.accounts.length === 0) {
				return cb(null, result);
			}

			return request.get({
				url: `${app.get('lisk address')}/voters?publicKey=${result.accounts[0].publicKey}`,
				json: true,
			}, (err, response, body) => {
				if (response.statusCode === 200) {
					result.accounts[0].voters = (body.accounts !== undefined &&
						body.accounts !== null && body.accounts.length > 0) ?
						body.accounts : null;
					_.each(result.accounts[0].voters, (d) => {
						d.knowledge = knowledge.inAccount(d);
					});
				} else if (response.statusCode === 204) {
					result.accounts[0].voters = null;
				}
				return cb(null, result);
			});
		};

		this.getIncomingTxsCnt = (result, cb) => {
			if (!result.accounts || result.accounts.length === 0) {
				return cb(null, result);
			}

			return request.get({
				url: `${app.get('lisk address')}/transactions?recipientId=${result.accounts[0].address}&limit=1`,
				json: true,
			}, (err, response, body) => {
				if (response.statusCode === 200) {
					result.accounts[0].incoming_cnt = body.count;
					result.accounts[0].secondSignature = body.transactions[0].secondSignature || null;
				} else if (response.statusCode === 204) {
					result.accounts[0].incoming_cnt = 0;
				}
				return cb(null, result);
			});
		};

		this.getOutgoingTxsCnt = (result, cb) => {
			if (!result.accounts || result.accounts.length === 0) {
				return cb(null, result);
			}

			return request.get({
				url: `${app.get('lisk address')}/transactions?senderId=${result.accounts[0].address}&limit=1`,
				json: true,
			}, (err, response, body) => {
				if (response.statusCode === 200) {
					result.accounts[0].outgoing_cnt = body.count;
					if (!result.accounts[0].secondSignature) {
						result.accounts[0].secondSignature = body.transactions[0].secondSignature || null;
					}
				} else if (response.statusCode === 204) {
					result.accounts[0].outgoing_cnt = 0;
				}
				return cb(null, result);
			});
		};

		// The new Account endpoint returns rewards instead
		this.getForged = (result, cb) => {
			if (!result.accounts || result.accounts.length === 0) {
				return cb(null, result);
			}
			return request.get({
				url: `${app.get('lisk address')}/delegates/forging/getForgedByAccount?generatorPublicKey=${result.accounts[0].publicKey}`,
				json: true,
			}, (err, response, body) => {
				if (response.statusCode === 200) {
					result.accounts[0].delegate.forged = body.forged;
				} else if (response.statusCode === 204) {
					result.accounts[0].delegate.forged = 0;
				}
				return cb(null, result);
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
					account.getAccount('address', params.address, cb);
				} else {
					account.getAccount('publicKey', params.publicKey, cb);
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
			if (result.error) {
				return error({ success: false, error: result.error });
			}
			result.accounts[0].success = true;
			return success(result.accounts[0]);
		});
	};

	function TopAccount() {
		const getDelegate = (account, cb) => {
			request.get({
				url: `${app.get('lisk address')}/delegates/?publicKey=${account.publicKey}`,
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
			url: `${app.get('lisk address')}/accounts/?sort=-balance&offset=${param(query.offset, 0)}&limit=${param(query.limit, 100)}`,
			json: true,
		}, (err, response, body) => {
			if (response.statusCode === 200) {
				return async.forEach(body.accounts, (a, cb) => {
					topAccount.getKnowledge(a, cb);
				}, () => success({ success: true, accounts: body.accounts }));
			}
			return error({ success: false, error: body.error });
		});
	};
};
