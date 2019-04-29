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
const path = require('path');
const program = require('commander');
const packageJson = require('./package.json');
const compression = require('compression');
const methodOverride = require('method-override');
let config = require('./config');

const app = express();

program
	.version(packageJson.version)
	.option('-c, --config <path>', 'config file path')
	.option('-p, --port <port>', 'listening port number')
	.option('-h, --host <ip>', 'listening host name or ip')
	.parse(process.argv);

if (program.config) {
	// eslint-disable-next-line import/no-dynamic-require
	config = require(path.resolve(process.cwd(), program.config));
}
app.set('host', program.host || config.host);
app.set('port', program.port || config.port);

app.set('version', packageJson.version);
app.set('strict routing', true);
app.set('lisk address', `http://${config.lisk.host}:${config.lisk.port}${config.lisk.apiPath}`);
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
		`connect-src 'self' ${connectSrc} https://www.google-analytics.com https://*.crazyegg.com;`,
		`img-src 'self' https:;`,
		`style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;`,
		`script-src 'self' 'unsafe-eval' 'unsafe-inline' https://tagmanager.google.com/ https://www.googletagmanager.com/ https://www.google-analytics.com/ https://dnn506yrbagrg.cloudfront.net/ https://*.ipify.org/ https://*.crazyegg.com/ http://trk.cetrk.com/ https://s3.amazonaws.com/trk.cetrk.com/;`,
		`font-src 'self' https://fonts.gstatic.com data:`,
	].join(' ');
	/* eslint-enable */

	res.setHeader('Content-Security-Policy', contentSecurityPolicy);
	return next();
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(compression());
app.use(methodOverride('X-HTTP-Method-Override'));

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(app.get('port'), app.get('host'));
