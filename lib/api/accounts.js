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

	function delegatesMapper(o) {
		return {
			address: o.account.address,
			approval: o.approval,
			missedblocks: o.missedBlocks,
			producedblocks: o.producedBlocks,
			productivity: o.productivity,
			publicKey: o.account.publicKey,
			rate: o.rank,
			username: o.username,
			vote: o.vote,
		};
	}

	function Account() {
		this.validAddress = address =>
			(typeof address === 'string' && address.match(/^[0-9]{1,21}[L|l]$/g));

		this.validPublicKey = publicKey =>
			(typeof publicKey === 'string' && publicKey.match(/^([A-Fa-f0-9]{2}){32}$/g));

		this.getVotesCall = (account, limit, offset, cb) => {
			request.get({
				url: `${app.get('lisk address')}/votes?address=${account.address}&limit=${limit}&offset=${offset}&sort=username:asc`,
				json: true,
			}, (err, response, body) => {
				if (err || response.statusCode !== 200) {
					return cb(err || 'Response was unsuccessful');
				}

				if (body && body.data && Array.isArray(body.data.votes)) {
					return cb(null, body.data.votes);
				}

				return cb(null, []);
			});
		}:
    
		this.getVotersCall = (account, limit, offset, cb) => {
			request.get({
				url: `${app.get('lisk address')}/voters?address=${account.address}&limit=${limit}&offset=${offset}&sort=username:asc`,
				json: true,
			}, (err, response, body) => {
				if (err || response.statusCode !== 200) {
					return cb(err || 'Response was unsuccessful');
				}

				if (body && body.data && Array.isArray(body.data.voters)) {
					account.voters = _.union(account.voters, body.data.voters);
				}

				// as core api limits the response to 100 items,
				// getVotersCall is called recursively untill all voters are returned
				if (body && body.data && account.voters.length < body.data.votes) {
					this.getVotersCall(account, limit, offset + limit, cb);
				} else {
					_.each(account.voters, (d) => {
						d.knowledge = knowledge.inAccount(d);
					});
					return cb(null, account);
				}
			});
		};

		this.getAccount = (address, cb) => {
			request.get({
				url: `${app.get('lisk address')}/accounts?address=${address}`,
				json: true,
			}, (err, response, body) => {
				if (err || response.statusCode !== 200) {
					return cb(err || 'Response was unsuccessful');
				} else if (body && Array.isArray(body.data)) {
					if (body.data.length > 0) {
						const account = body.data[0];
						account.knowledge = knowledge.inAccount(account);
						return cb(null, account);
					}
					return cb(null, []);
				}
				return cb(body.error);
			});
		};

		this.getAccountByPublicKey = (publicKey, cb) =>
			request.get({
				url: `${app.get('lisk address')}/accounts?publicKey=${publicKey}`,
				json: true,
			}, (err, response, body) => {
				if (err || response.statusCode !== 200) {
					return cb(err || 'Response was unsuccessful');
				} else if (body && Array.isArray(body.data)) {
					if (body.data.length > 0) {
						const account = body.data[0];
						account.knowledge = knowledge.inAccount(account);
						return cb(null, account);
					}
					return cb(null, []);
				}
				return cb(body.error);
			});

		this.getMultisignaturesGroups = (account, cb) => {
			request.get({
				url: `${app.get('lisk address')}/accounts/${account.address}/multisignature_groups`,
				json: true,
			}, (err, response, body) => {
				if (response.statusCode === 404 &&
					typeof body === 'object' &&
					body.message === 'Multisignature account not found'
				) {
					return cb(null, account);
				} else if (err || response.statusCode !== 200) {
					return cb(err || 'Response was unsuccessful');
				} else if (body && Array.isArray(body.data) && body.data.length > 0) {
					account.multisignatures = account.multisignatures || [];
					return cb(null, account);
				}
				return cb(body.error);
			});
		};

		this.getMultisignaturesMemberships = (account, cb) => {
			request.get({
				url: `${app.get('lisk address')}/accounts/${account.address}/multisignature_memberships`,
				json: true,
			}, (err, response, body) => {
				if (err || response.statusCode !== 200) {
					return cb(err || 'Response was unsuccessful');
				} else if (body && Array.isArray(body.data)) {
					if (body.data.length > 0) {
						account.multisignatures = _.extend(
							account.multisignatures || [],
							body.data[0].members.map(o => o.publicKey));
					}
					return cb(null, account);
				}
				return cb(body.error);
			});
		};

		this.getDelegate = (account, cb) => {
			if (!account.publicKey) {
				return cb(null, account);
			}
			return request.get({
				url: `${app.get('lisk address')}/delegates?publicKey=${account.publicKey}`,
				json: true,
			}, (err, response, body) => {
				if (err || response.statusCode !== 200) {
					return cb(err || 'Response was unsuccessful');
				} else if (body && Array.isArray(body.data) && body.data.length > 0) {
					account.delegate = delegatesMapper(body.data[0]);
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

			// it requires 2 calls because core api limits the response to 100 items
			return async.parallel([
				(callback) => {
					this.getVotesCall(account, 100, 0, callback);
				},
				(callback) => {
					this.getVotesCall(account, 100, 100, callback);
				},
			], (err, result) => {
				if (err) {
					return cb(err || 'Response was unsuccessful');
				}

				account.votes = _.union(result[0], result[1]);

				_.each(account.votes, (d) => {
					d.knowledge = knowledge.inAccount(d);
				});

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
				if (err || response.statusCode !== 200) {
					return cb(err || 'Response was unsuccessful');
				} else if (body && Array.isArray(body.data)) {
					account.voters = Array.isArray(body.data.voters)
						&& body.data.voters.length > 0 ? body.data.voters : null;
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
				url: `${app.get('lisk address')}/transactions?recipientId=${account.address}&limit=1`,
				json: true,
			}, (err, response, body) => {
				if (err || response.statusCode !== 200) {
					return cb(err || 'Response was unsuccessful');
				} else if (body && Array.isArray(body.data)) {
					account.incoming_cnt = body.meta.count;
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
				url: `${app.get('lisk address')}/transactions?senderId=${account.address}&limit=1`,
				json: true,
			}, (err, response, body) => {
				if (err || response.statusCode !== 200) {
					return cb(err || 'Response was unsuccessful');
				} else if (body && Array.isArray(body.data)) {
					account.outgoing_cnt = body.meta.count;
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
				url: `${app.get('lisk address')}/delegates/${account.address}/forging_statistics`,
				json: true,
			}, (err, response, body) => {
				if (err || response.statusCode !== 200) {
					return cb(err || 'Response was unsuccessful');
				} else if (body && body.data && body.data.forged) {
					account.delegate.forged = body.data.forged;
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
				account.getMultisignaturesGroups(result, cb);
			},
			(result, cb) => {
				account.getMultisignaturesMemberships(result, cb);
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

			// eslint-disable-next-line arrow-body-style
			const mappedResult = [result].map((o) => {
				return {
					address: o.address,
					balance: o.balance,
					delegate: o.delegate,
					incoming_cnt: o.incoming_cnt,
					knowledge: o.knowledge,
					multisignatures: o.multisignatures || [], // TODO: Check if possible
					outgoing_cnt: o.outgoing_cnt,
					publicKey: o.publicKey,
					secondPublicKey: o.secondPublicKey,
					secondSignature: o.secondSignature || '', // TODO: Check if possible to get
					success: o.success,
					u_multisignatures: o.u_multisignatures || [], // TODO: Check if possible
					unconfirmedBalance: o.unconfirmedBalance,
					unconfirmedSignature: o.unconfirmedSignature || '', // TODO: Check if possible
					voters: o.voters,
					votes: o.votes,
				};
			})[0];

			mappedResult.success = true;
			return success(mappedResult);
		});
	};

	function TopAccount() {
		const getDelegate = (account, cb) => {
			request.get({
				url: `${app.get('lisk address')}/delegates?publicKey=${account.publicKey}`,
				json: true,
			}, (err, response, body) => {
				if (err || response.statusCode !== 200) {
					return cb(err || 'Response was unsuccessful');
				} else if (body && Array.isArray(body.data)) {
					account.knowledge = knowledge.inDelegate(body.data[0]);
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

		// limit = 0 is not valid anymore
		if (Number(query.limit) === 0) query.limit = Number(100).toString();

		return request.get({
			url: `${app.get('lisk address')}/accounts/?sort=balance:desc&offset=${param(query.offset, 0)}&limit=${param(query.limit, 100)}`,
			json: true,
		}, (err, response, body) => {
			if (err || response.statusCode !== 200) {
				return error({ success: false, error: (err || 'Response was unsuccessful') });
			} else if (body && Array.isArray(body.data)) {
				// eslint-disable-next-line arrow-body-style
				const result = body.data.map((o) => {
					return {
						address: o.address,
						balance: o.balance,
						publicKey: o.publicKey,
					};
				});
				return async.forEach(result, (a, cb) => {
					topAccount.getKnowledge(a, cb);
				}, () => success({ success: true, accounts: result }));
			}
			return error({ success: false, error: body.error });
		});
	};
};