

let request = require('request'),
	_ = require('underscore'),
	async = require('async'),
	logger = require('../../utils/logger');

module.exports = function (app) {
	this.getTransaction = function (transactionId, error, success, url) {
		if (!url) {
			var confirmed = true;
			url = '/api/transactions/get?id=';
		}
		if (!transactionId) {
			return error({ success: false, error: 'Missing/Invalid transactionId parameter' });
		}

		async.waterfall([
			function (waterCb) {
				request.get({
					url: app.get('lisk address') + url + transactionId,
					json: true,
				}, (err, response, body) => {
					if (err || response.statusCode !== 200) {
						return error({ success: false, error: (err || 'Response was unsuccessful') });
					} else if (body.success === true) {
						return waterCb(null, body.transaction);
					} else if (confirmed) {
						return self.getUnconfirmedTransaction(transactionId, error, success);
					}
					return error({ success: false, error: body.error });
				});
			},
			processTransaction,
		], (err, transaction) => {
			if (err) {
				return error({ success: false, error: err });
			}

			const t = new Transaction();

			if (transaction.votes) {
				async.waterfall([
					function (cb) {
						if (transaction.votes.added.length) {
							const added = [];
							_.each(transaction.votes.added, (vote) => {
								added.push({ publicKey: vote });
							});

							async.forEach(added, (add, cb) => {
								t.getDelegate(add, cb);
							}, () => {
								transaction.votes.added = added;
								return cb(null, transaction);
							});
						} else {
							transaction.votes.added = null;
							return cb(null, transaction);
						}
					},
					function (result, cb) {
						if (result.votes.deleted.length) {
							const deleted = [];
							_.each(result.votes.deleted, (vote) => {
								deleted.push({ publicKey: vote });
							});

							async.forEach(deleted, (add, cb) => {
								t.getDelegate(add, cb);
							}, () => {
								result.votes.deleted = deleted;
								return cb(null, result);
							});
						} else {
							result.votes.deleted = null;
							return cb(null, result);
						}
					},
				], (err, result) => {
					if (err) {
						return error({ success: false, error: err });
					}
					return success({ success: true, transaction: result });
				});
			} else {
				return success({ success: true, transaction });
			}
		});
	};

	function Transaction() {
		this.getDelegate = function (forger, cb) {
			request.get({
				url: `${app.get('lisk address')}/api/delegates/get?publicKey=${forger.publicKey}`,
				json: true,
			}, (err, response, body) => {
				if (err || response.statusCode !== 200) {
					return cb(err || 'Response was unsuccessful');
				} else if (body.success === true) {
					forger.delegate = body.delegate;
				} else {
					forger.delegate = null;
				}
				return cb(null, forger);
			});
		};
	}

	this.getUnconfirmedTransaction = function (transactionId, error, success) {
		this.getTransaction(transactionId, error, success, '/api/transactions/unconfirmed/get?id=');
	};

	this.getUnconfirmedTransactions = function (error, success, transactions) {
		async.waterfall([
			function (cb) {
				request.get({
					url: `${app.get('lisk address')}/api/transactions/unconfirmed`,
					json: true,
				}, (err, response, body) => {
					if (err || response.statusCode !== 200) {
						return error({ success: false, error: (err || 'Response was unsuccessful') });
					} else if (body.success === true) {
						if (transactions) {
							body.transactions = concatenate(transactions, body);
							return cb(null, body.transactions);
						}
					} else {
						return error({ success: false, error: body.error });
					}
				});
			},
			processTransactions,
		], (err, result) => {
			if (err) {
				return error({ success: false, error: err });
			}
			return success({ success: true, transactions: result });
		});
	};

	this.getLastTransactions = function (error, success) {
		request.get({
			url: `${app.get('lisk address')}/api/transactions?orderBy=timestamp:desc&limit=20`,
			json: true,
		}, (err, response, body) => {
			if (err || response.statusCode !== 200) {
				return error({ success: false, error: (err || 'Response was unsuccessful') });
			} else if (body.success === true) {
				_.each(body.transactions, knowledge.inTx);
				return this.getUnconfirmedTransactions(error, success, body.transactions);
			}
			return error({ success: false, error: body.error });
		});
	};

	const normalizeTransactionParams = (params, error) => {
		if (!params || (!params.address && !params.senderId && !params.recipientId)) {
			return 'Missing/Invalid address parameter';
		}

		const directionQueries = [];
		const baseQuery = `${'orderBy=timestamp:desc' + '&offset='}${param(params.offset, 0)}&limit=${param(params.limit, 100)}`;

		if (params.direction === 'sent') {
			directionQueries.push(`${baseQuery}&and:senderId=${params.address}&and:type=0`);
		} else if (params.direction === 'received') {
			directionQueries.push(`${baseQuery}&and:recipientId=${params.address}&and:type=0`);
		} else if (params.direction === 'others') {
			for (let i = 1; i < 8; i++) {
				directionQueries.push(`${baseQuery}&and:senderId=${params.address}&and:type=${i}`);
			}
		} else if (params.address) {
			directionQueries.push(`${baseQuery}&and:recipientId=${params.address}&or:senderId=${params.address}`);
		} else {
			// advanced search
			let advanced = '';
			Object.keys(params).forEach((key) => {
				if (!(/key|url|parent|orderBy|offset|limit|type|recipientId|query/.test(key))) {
					advanced += `&and:${key}=${params[key]}`;
				}
			});
			// type might be comma separate or undefined
			if (params.type) {
				params.type.split(',').forEach((type) => {
					if (type) {
						directionQueries.push(`${baseQuery}${advanced}&and:type=${type}`);
					}
				});
			} else {
				directionQueries.push(`${baseQuery}${advanced}`);
			}

			// If recipientId is the same as senderId, create an extra request for it.
			if (params.recipientId === params.senderId) {
				const reqs = directionQueries.length;
				for (let i = 0; i < reqs; i++) {
					directionQueries.push(directionQueries[i].replace('senderId', 'recipientId'));
				}
			} else if (params.recipientId && !params.senderId) {
				directionQueries.forEach((directionQuery, index) => {
					directionQueries[index] = `${directionQuery}&and:recipientId=${params.recipientId}`;
				});
			}
		}

		return directionQueries;
	};

	this.getTransactionsByAddress = function (query, error, success) {
		const data = normalizeTransactionParams(query, error);
		if (typeof data === 'string') {
			return error({ success: false, error: data });
		}

		const indexOfById = (list, item) => {
			let index = -1;
			list.forEach((mem, i) => {
				if (mem.id === item.id) {
					index = i;
				}
			});

			return index;
		};

		async.waterfall([
			function (cb) {
				const transactionsList = [];
				let errorMessage;
				data.forEach((directionQuery, index) => {
					request.get({
						url: `${app.get('lisk address')}/api/transactions?${directionQuery}`,
						json: true,
					}, (err, response, body) => {
						if (err || response.statusCode !== 200) {
							errorMessage = (err || 'Response was unsuccessful');
						} else if (body.success === true) {
							body.transactions.forEach((transaction) => {
								if (indexOfById(transactionsList, transaction) < 0) {
									transactionsList.push(transaction);
								}
							});
						} else {
							errorMessage = body.error;
						}
						if (index === data.length - 1) {
							return (transactionsList.length > 0 || !errorMessage) ?
								cb(null, transactionsList) :
								error({ success: false, error: errorMessage });
						}
					});
				});
			},
			processTransactions,
		], (err, result) => {
			if (err) {
				return error({ success: false, error: err });
			}
			return success({ success: true, transactions: result });
		});
	};

	this.getTransactionsByBlock = function (query, error, success) {
		if (!query.blockId) {
			return error({ success: false, error: 'Missing/Invalid blockId parameter' });
		}

		async.waterfall([
			function (cb) {
				request.get({
					url: `${app.get('lisk address')}/api/transactions?blockId=${query.blockId}&orderBy=timestamp:desc` + `&offset=${param(query.offset, 0)}&limit=${param(query.limit, 100)}`,
					json: true,
				}, (err, response, body) => {
					if (err || response.statusCode !== 200) {
						return error({ success: false, error: (err || 'Response was unsuccessful') });
					} else if (body.success === true) {
						return cb(null, body.transactions);
					}
					return error({ success: false, error: body.error });
				});
			},
			processTransactions,
		], (err, result) => {
			if (err) {
				return error({ success: false, error: err });
			}
			return success({ success: true, transactions: result });
		});
	};

	// Private

	var self = this,
		delegateCache = [],
		exchange = app.exchange,
		knowledge = app.knownAddresses;

	var param = function (p, d) {
		p = parseInt(p);

		if (isNaN(p) || p < 0) {
			return d;
		}
		return p;
	};

	var concatenate = function (transactions, body) {
		transactions = transactions.concat(body.transactions);
		transactions.sort((a, b) => {
			if (a.timestamp > b.timestamp) {
				return -1;
			} else if (a.timestamp < b.timestamp) {
				return 1;
			}
			return 0;
		});

		let max = 10;
		if (transactions.length < max) {
			max = transactions.length;
		}

		return transactions.slice(0, 20);
	};

	var processTransaction = function (tx, cb) {
		// Gathering more information about transaction, we skip errors here
		async.waterfall([
			function (waterCb) {
				waterCb(null, knowledge.inTx(tx));
			},
			getSenderDelegate,
			getRecipientPublicKey,
			getRecipientDelegate,
		], (err, result) => cb(null, result));
	};

	var processTransactions = function (transactions, cb) {
		const tmpDelegateCache = [];

		// Gathering more information about transactions, we skip errors here
		async.eachSeries(transactions, (tx, seriesCb) => {
			async.waterfall([
				function (waterCb) {
					waterCb(null, knowledge.inTx(tx));
				},
				function (result, waterCb) {
					getSenderDelegate(result, waterCb, tmpDelegateCache);
				},
				function (result, waterCb) {
					getRecipientPublicKey(result, waterCb, tmpDelegateCache);
				},
				function (result, waterCb) {
					getRecipientDelegate(result, waterCb, tmpDelegateCache);
				},
			], (err, result) => {
				seriesCb(null, result);
			});
		}, err => cb(null, transactions));
	};

	const getDelegateFromCache = function (address, tmpDelegateCache) {
		// Checking global delegate cache
		if (delegateCache && delegateCache[address] !== undefined) {
			logger.debug(`Using global cache for: ${address}`);
			return delegateCache[address];
		}

		// Checking tmp delegate cache
		if (tmpDelegateCache && tmpDelegateCache[address] !== undefined) {
			logger.debug(`Using tmp cache for: ${address}`);
			return tmpDelegateCache[address];
		}

		return undefined;
	};

	const setDelegateToCache = function (delegate, tmpDelegateCache) {
		// Storing to global delegate cache
		if (delegateCache && !tmpDelegateCache && delegate && delegate.address && delegateCache[delegate.address] === undefined) {
			logger.debug(`Storing global cache for: ${delegate.address}`);
			delegateCache[delegate.address] = delegate;
			return true;
		}

		// Storing to tmp delegate cache
		if (tmpDelegateCache && delegate && tmpDelegateCache[delegate] === undefined) {
			logger.debug(`Storing tmp cache for: ${delegate}`);
			tmpDelegateCache[delegate] = null;
			return tmpDelegateCache;
		}

		return false;
	};

	var getSenderDelegate = function (transaction, cb, tmpDelegateCache) {
		if (!transaction.senderPublicKey) {
			transaction.senderDelegate = null;
			return cb(null, transaction);
		}

		const found = getDelegateFromCache(transaction.senderId, tmpDelegateCache);
		if (found !== undefined) {
			transaction.senderDelegate = found;
			return cb(null, transaction);
		}

		request.get({
			url: `${app.get('lisk address')}/api/delegates/get?publicKey=${transaction.senderPublicKey}`,
			json: true,
		}, (err, response, body) => {
			if (err || response.statusCode !== 200) {
				transaction.senderDelegate = null;
				return cb(null, transaction);
			} else if (body.success === true && body.delegate && body.delegate.address) {
				transaction.senderDelegate = body.delegate;
				setDelegateToCache(transaction.senderDelegate);
				return cb(null, transaction);
			}
			transaction.senderDelegate = null;
			setDelegateToCache(transaction.senderId, tmpDelegateCache);
			return cb(null, transaction);
		});
	};

	var getRecipientPublicKey = function (transaction, cb, tmpDelegateCache) {
		if (!transaction.recipientId || transaction.type !== 0) {
			transaction.recipientPublicKey = null;
			return cb(null, transaction);
		}

		const found = getDelegateFromCache(transaction.recipientId, tmpDelegateCache);
		if (found !== undefined) {
			transaction.recipientPublicKey = (found ? found.publicKey : null);
			transaction.recipientDelegate = found;
			return cb(null, transaction);
		}

		request.get({
			url: `${app.get('lisk address')}/api/accounts/getPublicKey?address=${transaction.recipientId}`,
			json: true,
		}, (err, response, body) => {
			if (err || response.statusCode !== 200) {
				transaction.recipientPublicKey = null;
				return cb(null, transaction);
			} else if (body.success === true && body.publicKey) {
				transaction.recipientPublicKey = body.publicKey;
				return cb(null, transaction);
			}
			transaction.recipientPublicKey = null;
			return cb(null, transaction);
		});
	};

	var getRecipientDelegate = function (transaction, cb, tmpDelegateCache) {
		if (!transaction.recipientPublicKey) {
			transaction.recipientDelegate = null;
			return cb(null, transaction);
		}

		request.get({
			url: `${app.get('lisk address')}/api/delegates/get?publicKey=${transaction.recipientPublicKey}`,
			json: true,
		}, (err, response, body) => {
			if (err || response.statusCode !== 200) {
				transaction.recipientDelegate = null;
				return cb(null, transaction);
			} else if (body.success === true && body.delegate && body.delegate.address) {
				transaction.recipientDelegate = body.delegate;
				setDelegateToCache(transaction.recipientDelegate);
				return cb(null, transaction);
			}
			transaction.recipientDelegate = null;
			setDelegateToCache(transaction.recipientId, tmpDelegateCache);
			return cb(null, transaction);
		});
	};
};
