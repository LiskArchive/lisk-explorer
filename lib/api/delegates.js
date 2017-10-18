const request = require('request');
const _ = require('underscore');
const async = require('async');

module.exports = function (app) {
	const parseDelegates = (delegates) => {
		_.each(delegates, (d) => {
			d.productivity = Math.abs(parseFloat(d.productivity)) || 0.0;
		});

		return delegates;
	};

	function Active() {
		this.getActive = function (cb) {
			request.get({
				url: `${app.get('lisk address')}/delegates/?sort=rate:asc&limit=101`,
				json: true,
			}, (err, response, body) => {
				if (response.statusCode === 200) {
					body.delegates = parseDelegates(body.delegates);
					return cb(null, body);
				}
				return cb(body.error);
			});
		};

		this.getForged = function (delegate, cb) {
			request.get({
				url: `${app.get('lisk address')}/delegates/forging/getForgedByAccount?generatorPublicKey=${delegate.publicKey}`,
				json: true,
			}, (err, response, body) => {
				if (response.statusCode === 200) {
					delegate.forged = body.forged;
					return cb();
				}
				delegate.forged = 0;
				return cb();
			});
		};
	}

	this.getActive = function (error, success) {
		const delegates = new Active();

		async.waterfall([
			(cb) => {
				delegates.getActive(cb);
			},
		], (err, result) => {
			if (result.error) {
				return error({ success: false, error: result.error });
			}
			result.success = true;
			// @todo remove this by #285
			result.totalCount = result.delegates.length;
			return success(result);
		});
	};

	function Standby(n) {
		this.limit = 20;
		this.offset = n > 0 ? parseInt(n, 10) : 0;

		this.pagination = function (totalCount) {
			const pagination = {};
			pagination.currentPage = parseInt(this.offset / this.limit, 10) + 1;

			let totalPages = parseInt(totalCount / this.limit, 10);
			if (totalPages < totalCount / this.limit) { totalPages++; }

			if (pagination.currentPage > 1) {
				pagination.before = true;
				pagination.previousPage = pagination.currentPage - 1;
			}

			if (pagination.currentPage < totalPages) {
				pagination.more = true;
				pagination.nextPage = pagination.currentPage + 1;
			}

			return pagination;
		};
	}

	this.getStandby = function (n, error, success) {
		const delegates = new Standby(n);

		request.get({
			url: `${app.get('lisk address')}/delegates/?sort=rate:asc&limit=${delegates.limit}&offset=${delegates.offset + 101}`,
			json: true,
		}, (err, response, body) => {
			if (response.statusCode === 200) {
				body.delegates = parseDelegates(body.delegates);
				// @todo Remove this by #285
				body.totalCount = body.count - 101;
				delete body.count;
				body.pagination = delegates.pagination(body.totalCount);
				body.success = true;
				return success(body);
			}
			return error({ success: false, error: body.error });
		});
	};

	function Registrations() {
		this.getTransactions = function (cb) {
			request.get({
				url: `${app.get('lisk address')}/transactions/?sort=timestamp:desc&limit=5&type=2`,
				json: true,
			}, (err, response, body) => {
				if (response.statusCode === 200) {
					return cb(null, body.transactions);
				}
				return cb(body.error);
			});
		};

		this.getDelegate = function (tx, cb) {
			request.get({
				url: `${app.get('lisk address')}/delegates/?address=${tx.senderId}`,
				json: true,
			}, (err, response, body) => {
				if (response.statusCode === 200) {
					tx.delegate = body.delegates[0];
					return cb();
				}
				return cb(body.error);
			});
		};
	}

	this.getLatestRegistrations = function (error, success) {
		const registrations = new Registrations();

		async.waterfall([
			(cb) => {
				registrations.getTransactions(cb);
			},
			(transactions, cb) => {
				async.each(transactions, (tx, callback) => {
					registrations.getDelegate(tx, callback);
				}, (err) => {
					if (err) {
						return cb(err);
					}
					return cb(null, transactions);
				});
			},
		], (err, transactions) => {
			if (err) {
				return error({ success: false, error: err });
			}
			return success({ success: true, transactions });
		});
	};

	function Votes() {
		this.getVotes = (cb) => {
			request.get({
				url: `${app.get('lisk address')}/transactions/?sort=timestamp:desc&limit=5&type=3`,
				json: true,
			}, (err, response, body) => {
				if (response.statusCode === 200) {
					return cb(null, body.transactions);
				}
				return cb(body.error);
			});
		};

		this.getDelegate = (tx, cb) => {
			request.get({
				url: `${app.get('lisk address')}/delegates/?publicKey=${tx.senderPublicKey}`,
				json: true,
			}, (err, response, body) => {
				if (response.statusCode === 200) {
					tx.delegate = body.delegate;
					return cb();
				}
				tx.delegate = null;
				return cb();
			});
		};
	}

	this.getLatestVotes = function (error, success) {
		const votes = new Votes();

		async.waterfall([
			(cb) => {
				votes.getVotes(cb);
			},
			(transactions, cb) => {
				async.each(transactions,
					(tx, callback) => { votes.getDelegate(tx, callback); },
					() => cb(null, transactions));
			},
		], (err, transactions) => {
			if (err) {
				return error({ success: false, error: err });
			}
			return success({ success: true, transactions });
		});
	};

	this.getNextForgers = function (error, success) {
		request.get({
			url: `${app.get('lisk address')}/delegates/forgers?limit=101`,
			json: true,
		}, (err, response, body) => {
			if (response.statusCode === 200) {
				// @todo remove the map by #285
				return success({ success: true, delegates: body.delegates.map(item => item.publicKey) });
			}
			const message = (body && body.error) ? body.error : 'Response was unsuccessful';
			return error({ success: false, error: message });
		});
	};

	function LastBlock() {
		this.getBlock = function (cb) {
			request.get({
				url: `${app.get('lisk address')}/blocks?&sort=height:desc&limit=1`,
				json: true,
			}, (err, response, body) => {
				if (response.statusCode === 200 && _.size(body.blocks) === 1) {
					// Remove by #285
					const block = Object.assign({}, body.blocks[0], body.blocks[0].forged);
					block.previousBlock = block.previousBlockId;
					block.generatorId = block.generatorAddress;
					delete block.generatorAddress;
					delete block.forged;
					delete block.previousBlockId;
					return cb(null, block);
				}
				return cb(body.error);
			});
		};

		this.getDelegate = function (block, cb) {
			request.get({
				url: `${app.get('lisk address')}/delegates/?publicKey=${block.generatorPublicKey}`,
				json: true,
			}, (err, response, body) => {
				if (response.statusCode === 200) {
					block.delegate = body.delegates[0];
				} else {
					block.delegate = null;
				}
				return cb(null, block);
			});
		};
	}

	this.getLastBlock = function (error, success) {
		const lastBlock = new LastBlock();

		async.waterfall([
			function (cb) {
				lastBlock.getBlock(cb);
			},
			function (result, cb) {
				lastBlock.getDelegate(result, cb);
			},
		], (err, result) => {
			if (err) {
				return error({ success: false, error: err });
			}
			return success({ success: true, block: result });
		});
	};

	this.getLastBlocks = function (params, error, success) {
		if (!params.publicKey) {
			return error({ success: false, error: 'Missing/Invalid publicKey parameter' });
		}
		if (isNaN(parseInt(params.limit, 10)) || params.limit > 20) {
			params.limit = 20;
		}
		return request.get({
			url: `${app.get('lisk address')}/blocks?sort=height:desc&generatorPublicKey=${params.publicKey}&limit=${params.limit}`,
			json: true,
		}, (err, response, body) => {
			if (err || response.statusCode !== 200) {
				return error({ success: false, error: err });
			}
			body.blocks = _.isArray(body.blocks) ? body.blocks : [];
			// Remove by #285
			body.blocks.forEach((item) => {
				item.previousBlock = item.previousBlockId;
				item.generatorId = item.generatorAddress;
				delete item.generatorAddress;
				delete item.forged;
				delete item.previousBlockId;
				return item;
			});
			return success({ success: true, blocks: body.blocks });
		});
	};

	this.getSearch = function (params, error, success) {
		if (!params || !params.match(/^(?![0-9]{1,21}[L]$)[0-9a-z.]+/i)) {
			return error({ success: false, error: 'Missing/Invalid username parameter' });
		}
		return request.get({
			url: `${app.get('lisk address')}/delegates/?q=${params}&limit=1`,
			json: true,
		}, (err, response, body) => {
			if (response.statusCode === 200) {
				return success({ success: true, address: body.delegates[0].address });
			}
			return error({ success: false, error: (body && body.error) ? body.error : (err || 'Delegate not found') });
		});
	};
};
