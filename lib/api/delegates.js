const request = require('request');
const _ = require('underscore');
const async = require('async');
const logger = require('../../utils/logger');

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
				url: `${app.get('lisk address')}/delegates/?publicKey=${tx.senderPublicKey}`,
				json: true,
			}, (err, response, body) => {
				if (response.statusCode === 200) {
					tx.delegate = body.delegate;
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
				url: `${app.get('lisk address')}/delegates/get?publicKey=${tx.senderPublicKey}`,
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
			url: `${app.get('lisk address')}/api/delegates/getNextForgers?limit=101`,
			json: true,
		}, (err, response, body) => {
			if (err || response.statusCode !== 200) {
				return error({ success: false, error: (err || 'Response was unsuccessful') });
			} else if (body.success === true) {
				return success({ success: true, delegates: body.delegates });
			}
			return error({ success: false, error: body.error });
		});
	};

	this.getDelegateProposals = function (error, success) {
		let offset = 0;
		let nextPage = false;
		const limit = 25;
		const url = 'https://forum.lisk.io/viewforum.php?f=48&start=';
		/**
		 * @todo what?
		 */
		const nextPageRegex = /<li class="next"><a href.+? rel="next" role="button">/m;
		const proposalRegex = /<a href="\.\/viewtopic\.php\?f=48&amp;t=(\d+)&amp;sid=.+?" class="topictitle">(.+?)\s+(?:[-–](?:\s*rank)?\s*#\s*\d+\s*)?.*?[-–]\s+(.+?)<\/a>/mgi;
		const result = [];

		async.doUntil(
			(next) => {
				logger.info(`Parsing delegate proposals: ${url}${offset}`);
				request.get({
					url: url + offset,
					json: false,
				}, (err, resp, body) => {
					if (err || resp.statusCode !== 200) {
						return next(err || 'Response was unsuccessful');
					}

					// Parse delegate proposal topics titles
					let m;
					do {
						m = proposalRegex.exec(body);
						if (m) {
							result.push({ topic: m[1], name: m[2].toLowerCase(), description: _.unescape(m[3]) });
						}
					} while (m);

					// Continue if there is next page
					nextPage = nextPageRegex.exec(body);
					return next();
				});
			},
			() => {
				offset += limit;
				return !nextPage;
			},
			(err) => {
				if (err) {
					error({ success: false, error: err || 'Unable to parse delegate proposals' });
				} else {
					success({ success: true, proposals: result, count: result.length });
				}
			});
	};

	function LastBlock() {
		this.getBlock = function (cb) {
			request.get({
				url: `${app.get('lisk address')}/blocks?&sort=height:desc&limit=1`,
				json: true,
			}, (err, response, body) => {
				if (response.statusCode === 200 && _.size(body.blocks) === 1) {
					return cb(null, body.blocks[0]);
				}
				return cb(body.error);
			});
		};

		this.getDelegate = function (block, cb) {
			request.get({
				url: `${app.get('lisk address')}/delegates/get?publicKey=${block.generatorPublicKey}`,
				json: true,
			}, (err, response, body) => {
				if (response.statusCode === 200) {
					block.delegate = body.delegate;
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
			url: `${app.get('lisk address')}/api/blocks?orderBy=height:desc&generatorPublicKey=${params.publicKey}&limit=${params.limit}`,
			json: true,
		}, (err, response, body) => {
			if (err || response.statusCode !== 200) {
				return error({ success: false, error: err });
			}
			body.blocks = _.isArray(body.blocks) ? body.blocks : [];
			return success({ success: true, blocks: body.blocks });
		});
	};

	this.getSearch = function (params, error, success) {
		if (!params || !params.match(/^(?![0-9]{1,21}[L]$)[0-9a-z.]+/i)) {
			return error({ success: false, error: 'Missing/Invalid username parameter' });
		}
		return request.get({
			url: `${app.get('lisk address')}/api/delegates/search?q=${params}&limit=1`,
			json: true,
		}, (err, response, body) => {
			if (err || response.statusCode !== 200 || body.error) {
				return error({ success: false, error: (body.error ? body.error : err) });
			}
			if (!body.delegates || !body.delegates[0]) {
				return error({ success: false, error: 'Delegate not found' });
			}
			return success({ success: true, address: body.delegates[0].address });
		});
	};
};
