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
const Benchmark = require('benchmark');

const express = require('express');
const config = require('./config');

config.enableExchange = false;

const api = require('./lib/api');
const benchmarks = require('./benchmarks');
const utils = require('./utils');
const logger = require('./utils/logger');

const suite = new Benchmark.Suite('api');
const app = express();
app.exchange = new utils.exchange(config);
app.knownAddresses = new utils.knownAddresses();
app.knownAddresses.load();

app.set('lisk address', config.lisk.http);
app.set('freegeoip address', config.freegeoip);

const tests = new benchmarks(app, api);

suite.add('accounts.getAccount', tests.accounts.getAccount, { defer: true })
	.add('accounts.getTopAccounts', tests.accounts.getTopAccounts, { defer: true });

suite.add('blocks.getLastBlocks', tests.blocks.getLastBlocks, { defer: true })
	.add('blocks.getBlock', tests.blocks.getBlock, { defer: true })
	.add('blocks.getBlockStatus', tests.blocks.getBlockStatus, { defer: true });

suite.add('common.getTicker', tests.common.getTicker, { defer: true })
	.add('common.search', tests.common.search, { defer: true });

suite.add('delegates.getActive', tests.delegates.getActive, { defer: true })
	.add('delegates.getStandby', tests.delegates.getStandby, { defer: true })
	.add('delegates.getLatestRegistrations', tests.delegates.getLatestRegistrations, { defer: true })
	.add('delegates.getLatestVotes', tests.delegates.getLatestVotes, { defer: true })
	.add('delegates.getLastBlock', tests.delegates.getLastBlock, { defer: true });

suite.add('statistics.getBlocks', tests.statistics.getBlocks, { defer: true, minSamples: 3 })
	.add('statistics.getLastBlock', tests.statistics.getLastBlock, { defer: true })
	.add('statistics.getPeers', tests.statistics.getPeers, { defer: true, minSamples: 3 });

suite.add('transactions.getTransaction', tests.transactions.getTransaction, { defer: true })
	.add('transactions.getUnconfirmedTransactions', tests.transactions.getUnconfirmedTransactions, { defer: true })
	.add('transactions.getLastTransactions', tests.transactions.getLastTransactions, { defer: true })
	.add('transactions.getTransactionsByAddress', tests.transactions.getTransactionsByAddress, { defer: true })
	.add('transactions.getTransactionsByBlock', tests.transactions.getTransactionsByBlock, { defer: true });

suite.on('cycle', (event) => {
	logger.info(String(event.target));
}).on('complete', function () {
	logger.info(`Slowest is ${this.filter('slowest').pluck('name')}`);
	logger.info(`Fastest is ${this.filter('fastest').pluck('name')}`);
	logger.info('Done :)');
});

logger.info('Running benchmarks...');
suite.run({ async: false });
