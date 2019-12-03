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
const express = require('express');
let config = require('./config');
const routes = require('./api');
const path = require('path');
const cache = require('./cache');
const program = require('commander');
const async = require('async');
const packageJson = require('./package.json');
const split = require('split');
const logger = require('./utils/logger');
const request = require('request');

const app = express();
const api = require('./lib/api');
const utils = require('./utils');

program
	.version(packageJson.version)
	.option('-c, --config <path>', 'config file path')
	.option('-p, --port <port>', 'listening port number')
	.option('-h, --host <ip>', 'listening host name or ip')
	.option('-rp, --redisPort <port>', 'redis port')
	.parse(process.argv);

if (program.config) {
	// eslint-disable-next-line import/no-dynamic-require
	config = require(path.resolve(process.cwd(), program.config));
}
app.set('host', program.host || config.host);
app.set('port', program.port || config.port);

if (program.redisPort) {
	config.redis.port = program.redisPort;
}
const client = require('./redis')(config);

app.locals.redis = client;
app.use((req, res, next) => {
	req.redis = client;
	return next();
});

app.candles = new utils.candles(config, client);
app.exchange = new utils.exchange(config);
app.delegates = new api.delegates(app);
app.knownAddresses = new utils.knownAddresses(app, config, client);
app.orders = new utils.orders(config, client);

app.set('version', packageJson.version);
app.set('strict routing', true);
app.set('lisk address', `http://${config.lisk.host}:${config.lisk.port}${config.lisk.apiPath}`);
app.set('lisk websocket address', `http://${config.lisk.host}:${config.lisk.port}`);
app.set('freegeoip address', `http://${config.freegeoip.host}:${config.freegeoip.port}`);
app.set('exchange enabled', config.exchangeRates.enabled);
app.set('uiMessage', config.uiMessage);

app.use((req, res, next) => {
	res.setHeader('X-Frame-Options', 'DENY');
	res.setHeader('X-Content-Type-Options', 'nosniff');
	res.setHeader('X-XSS-Protection', '1; mode=block');

	/* eslint-disable */
	const connectSrc = `ws://${req.get('host')} wss://${req.get('host')}`;
	const contentSecurityPolicy = [
		`default-src 'self';`,
		`frame-ancestors 'none';`,
		//`connect-src 'self' ${connectSrc} https://www.google-analytics.com https://*.crazyegg.com;`,
		`img-src 'self' https:;`,
		`style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;`,
		`script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.ipify.org/ https://*.crazyegg.com/ http://trk.cetrk.com/;`,
		`font-src 'self' https://fonts.gstatic.com data:`,
	].join(' ');
	/* eslint-enable */

	res.setHeader('Content-Security-Policy', contentSecurityPolicy);
	return next();
});

app.use(express.static(path.join(__dirname, 'public')));

const morgan = require('morgan');

app.use(morgan('combined', {
	skip(req, res) {
		return parseInt(res.statusCode, 10) < 400;
	},
	stream: split().on('data', (data) => {
		logger.error(data);
	}),
}));
app.use(morgan('combined', {
	skip(req, res) {
		return parseInt(res.statusCode, 10) >= 400;
	},
	stream: split().on('data', (data) => {
		logger.debug(data);
	}),
}));
const compression = require('compression');

app.use(compression());
const methodOverride = require('method-override');

app.use(methodOverride('X-HTTP-Method-Override'));

const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true,
}));

const allowCrossDomain = function (req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	next();
};
app.use(allowCrossDomain);

app.use((req, res, next) => {
	logger.debug(req.originalUrl);

	try {
		decodeURIComponent(req.path);
	} catch (err) {
		logger.debug(err);
		return res.redirect('/');
	}

	if (req.originalUrl === undefined || req.originalUrl.split('/')[1] !== 'api') {
		return next();
	}

	if (cache.cacheIgnoreList.indexOf(req.originalUrl) >= 0) {
		return next();
	}

	return req.redis.get(req.originalUrl, (err, json) => {
		if (err) {
			logger.warn(err);
			return next();
		} else if (json) {
			try {
				json = JSON.parse(json);
			} catch (e) {
				return next();
			}

			return res.json(json);
		}
		return next();
	});
});

logger.info('Loading routes...');

routes(app);

logger.info('Routes loaded');

app.use((req, res, next) => {
	logger.debug(req.originalUrl);

	if (req.originalUrl === undefined || req.originalUrl.split('/')[1] !== 'api' || !req.json) {
		return next();
	}

	if (cache.cacheIgnoreList.indexOf(req.originalUrl) >= 0) {
		return res.json(req.json);
	}

	const ttl = cache.cacheTTLOverride[req.originalUrl] || config.cacheTTL;

	req.redis.setex(req.originalUrl, ttl, JSON.stringify(req.json), (err) => {
		if (err) {
			logger.warn(err);
		}
	});

	return res.json(req.json);
});

app.get('*', (req, res, next) => {
	if (req.url.indexOf('api') !== 1) {
		return res.sendFile(path.join(__dirname, 'public', 'index.html'));
	}
	return next();
});

const getNodeConstants = () => new Promise((success, error) => {
	request.get({
		url: `${app.get('lisk address')}/node/constants`,
		json: true,
	}, (err, response, body) => {
		if (err) {
			return error({ success: false, error: err.message });
		} else if (response.statusCode === 200) {
			if (body && body.data) {
				app.set('nodeConstants', body.data);
				return success({
					version: body.data.version,
					epoch: new Date(body.data.epoch) / 1000,
					protocolVersion: body.data.protocolVersion,
					nethash: body.data.nethash,
					majorVersion: body.data.version.split('.')[0],
					minorVersion: body.data.version.split('.')[1],
				});
			}
		}
		return error({ success: false, error: body.error });
	});
});

const SERVER_FAILURE_TIMEOUT = 5000; // ms
const status = { NOT_RUNNING: 0, OK: 1 };
let serverStatus = status.NOT_RUNNING;

const startServer = (cb) => {
	getNodeConstants().then((result) => {
		logger.info(`Connected to the node ${app.get('lisk address')}, Lisk Core version ${result.version}`);
		Object.keys(result).forEach((item) => {
			app.set(`node.${item}`, result[item]);
		});
		const server = app.listen(app.get('port'), app.get('host'), (err) => {
			if (err) {
				logger.info(err);
			} else {
				logger.info(`Lisk Explorer started at ${app.get('host')}:${app.get('port')}`);

				const io = require('socket.io').listen(server);
				require('./sockets')(app, io);
				app.delegates.loadAllDelegates();
				app.knownAddresses.load();
				serverStatus = status.OK;
			}
		});
	}).catch(() => {
		logger.error(`The following node ${app.get('lisk address')} has an incompatible API or is not available.`);
		setTimeout(cb, SERVER_FAILURE_TIMEOUT);
	});
};

const loadRates = (cb) => {
	app.exchange.loadRates();
	cb(null);
};

async.parallel([
	loadRates,
], () => {
	async.until(() => (serverStatus === status.OK), startServer);
});
