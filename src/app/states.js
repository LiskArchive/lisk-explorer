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
import App from './app';

App.config(($stateProvider, $urlRouterProvider, $locationProvider) => {
	$stateProvider
		.state('home', {
			url: '/',
			parentDir: 'home',
			component: 'home',
		})
		.state('blocks', {
			url: '/blocks/:page',
			parentDir: 'home',
			component: 'blocks',
		})
		.state('block', {
			url: '/block/:blockId',
			parentDir: 'home',
			component: 'block',
		})
		.state('transactions', {
			url: '/txs/:page',
			parentDir: 'home',
			component: 'transactions',
		})
		.state('transaction', {
			url: '/tx/:txId',
			parentDir: 'home',
			component: 'transaction',
		})
		.state('address', {
			url: '/address/:address',
			parentDir: 'home',
			component: 'address',
		})
		.state('activity-graph', {
			url: '/activityGraph',
			parentDir: 'home',
			component: 'activityGraph',
		})
		.state('top-accounts', {
			url: '/topAccounts',
			parentDir: 'home',
			component: 'topAccounts',
		})
		.state('delegate-monitor', {
			url: '/delegateMonitor',
			parentDir: 'home',
			component: 'delegateMonitor',
		})
		.state('market-watcher', {
			url: '/marketWatcher',
			parentDir: 'home',
			component: 'marketWatcher',
		})
		.state('network-monitor', {
			url: '/networkMonitor',
			parentDir: 'home',
			component: 'networkMonitor',
		})
		.state('delegate', {
			url: '/delegate/:delegateId',
			parentDir: 'home',
			component: 'delegate',
		})
		.state('error', {
			url: '404',
			parentDir: 'home',
			component: 'c404',
		});
	// $urlRouterProvider.otherwise('/404');
	$locationProvider.html5Mode(true);
});
