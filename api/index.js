const accounts = require('./accounts.js');
const blocks = require('./blocks.js');
const common = require('./common.js');
const delegates = require('./delegates.js');
const exchanges = require('./exchanges.js');
const statistics = require('./statistics.js');
const transactions = require('./transactions.js');
const handler = require('./handler');
const config = require('../config');

const routes = [].concat(transactions, accounts, blocks, common,
	delegates, exchanges, statistics);

const modules = {};
const services = {};
let commonServiceModule;

module.exports = (app) => {
	routes.forEach((route) => {
		const name = route.service === '' ? 'common' : route.service;
		if (!modules[name]) {
			// eslint-disable-next-line import/no-dynamic-require
			modules[name] = require(`../lib/api/${route.service}`);
		}

		if (!services[name]) {
			services[name] = (name === 'common') ?
				new modules[name].common(app, modules[name]) :
				new modules[name](app);
		}
		app.get(`/api/${route.path}`, (req, res, next) =>
			handler(services[name], route.path.split('/').slice(-1).pop(), route.params(req), req, res, next));
	});

	app.get('/api/exchanges', (req, res) => {
		const result = {
			success: true,
			enabled: config.marketWatcher.enabled,
			exchanges: config.marketWatcher.enabled ? config.marketWatcher.exchanges : [],
		};
		return res.json(result);
	});

	app.get('/api/version', (req, res) => {
		const data = commonServiceModule.version();
		return res.json(data);
	});
};
