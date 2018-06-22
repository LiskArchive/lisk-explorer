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
const coreUtils = require('../../utils/core.js');

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
		if (!o) return {};
		return {
			address: o.address,
			publicKey: o.publicKey,
			approval: o.delegate.approval,
			missedblocks: o.delegate.missedBlocks,
			producedblocks: o.delegate.producedBlocks,
			productivity: o.delegate.productivity,
			rate: o.delegate.rank,
			username: o.delegate.username,
			vote: o.delegate.vote,
		};
	}

	function topAccountMapper(o) {
		if (!o) return {};
		return {
			address: o.address,
			balance: o.balance,
			publicKey: o.publicKey,
			knowledge: o.knowledge,
		};
	}

	function Account() {
		this.validAddress = address =>
			(typeof address === 'string' && address.match(/^[0-9]{1,21}[L|l]$/g));

		this.validPublicKey = publicKey =>
			(typeof publicKey === 'string' && publicKey.match(/^([A-Fa-f0-9]{2}){32}$/g));

		this.getVotesCall = (account, limit, offset, cb) => {
			request.get({
				url: `${app.get('lisk address')}/votes?address=${coreUtils.parseAddress(account.address)}&limit=${limit}&offset=${offset}&sort=username:asc`,
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
		};

		this.getVotersCall = (account, limit, offset, cb) => {
			request.get({
				url: `${app.get('lisk address')}/voters?address=${coreUtils.parseAddress(account.address)}&limit=${limit}&offset=${offset}&sort=username:asc`,
				json: true,
			}, (err, response, body) => {
				if (err || response.statusCode !== 200) {
					return cb(err || 'Response was unsuccessful');
				}

				if (body && body.data && Array.isArray(body.data.voters)) {
					return cb(null, body.data.voters);
				}
				return cb(body.error);
			});
		};

		this.getAccount = (params, cb) => {
			let address;

			if (!params.address && !params.publicKey) {
				return cb({ success: false, error: 'Missing/Invalid address or publicKey parameter' });
			}

			if (params.address) {
				address = coreUtils.parseAddress(params.address);
				if (!this.validAddress(address)) {
					return cb({ success: false, error: 'Invalid address parameter' });
				}
			}

			if (params.publicKey && !this.validPublicKey(params.publicKey)) {
				return cb({ success: false, error: 'Invalid publicKey parameter' });
			}

			const query = address ? `address=${address}` : `publicKey=${params.publicKey}`;

			return request.get({
				url: `${app.get('lisk address')}/accounts?${query}`,
				json: true,
			}, (err, response, body) => {
				if (err || response.statusCode !== 200) {
					return cb(err || 'Response was unsuccessful');
				} else if (body && Array.isArray(body.data)) {
					if (body.data.length > 0) {
						return cb(null, body.data[0]);
					}
					return cb(null, []);
				}
				return cb(body.error);
			});
		};

		this.getMultisignaturesGroups = (account, cb) => {
			request.get({
				url: `${app.get('lisk address')}/accounts/${coreUtils.parseAddress(account.address)}/multisignature_groups`,
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
			if (account.delegate) {
				account.delegate = delegatesMapper(account);
			} else {
				account.delegate = null;
			}

			knowledge.setKnowledge(account, () => cb(null, account));
		};

		this.getVotes = (account, cb) => {
			if (!account.address) {
				return cb(null, account);
			}

			return this.getVotesCall(account, 101, 0, (err, result) => {
				if (err) {
					return cb(err || 'Response was unsuccessful');
				}

				account.votes = result;

				return async.forEach(account.votes, (vote, forEachCallback) => {
					knowledge.setKnowledge(vote, () => forEachCallback());
				}, () => cb(null, account));
			});
		};

		this.getVoters = (account, cb) => {
			if (!account.address) {
				return cb(null, account);
			}

			const limit = 100;
			let offset = 0;
			account.voters = [];

			return async.doUntil(
				(next) => {
					this.getVotersCall(account, limit, offset, next);
				},
				(data) => {
					account.voters = _.union(account.voters, data);
					offset += limit;
					return data.length < limit;
				},
				(err) => {
					if (err) {
						return cb(err || 'Response was unsuccessful');
					}

					return async.forEach(account.voters, (voter, forEachCallback) => {
						knowledge.setKnowledge(voter, () => forEachCallback());
					}, () => cb(null, account));
				});
		};

		this.getIncomingTxsCnt = (account, cb) => {
			if (!account.address) {
				return cb(null, account);
			}

			return request.get({
				url: `${app.get('lisk address')}/transactions?recipientId=${coreUtils.parseAddress(account.address)}&limit=1`,
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
				url: `${app.get('lisk address')}/transactions?senderId=${coreUtils.parseAddress(account.address)}&limit=1`,
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
				url: `${app.get('lisk address')}/delegates/${coreUtils.parseAddress(account.address)}/forging_statistics`,
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

		return async.waterfall([
			(cb) => {
				account.getAccount(params, cb);
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
				if (!o) return {};
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

	this.getTopAccounts = (query, error, success) => {
		// limit = 0 is not valid anymore
		if (Number(query.limit) === 0) query.limit = Number(100).toString();

		return request.get({
			url: `${app.get('lisk address')}/accounts/?sort=balance:desc&offset=${param(query.offset, 0)}&limit=${param(query.limit, 100)}`,
			json: true,
		}, (err, response, body) => {
			if (err || response.statusCode !== 200) {
				return error({ success: false, error: (err || 'Response was unsuccessful') });
			} else if (body && Array.isArray(body.data)) {
				const accounts = body.data.map(topAccountMapper);
				return async.forEach(accounts, (account, forEachCallback) => {
					knowledge.setKnowledge(account, () => forEachCallback());
				}, () => {
					success({ success: true, accounts });
				});
			}
			return error({ success: false, error: body.error });
		});
	};
};
