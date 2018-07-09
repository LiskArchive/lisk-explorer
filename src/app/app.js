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
import angular from 'angular';
import 'angular-ui-router';
import 'angular-resource';
import 'angular-animate';
import 'angular-ui-bootstrap';
import 'angular-gettext';
import 'angular-advanced-searchbox';
// import 'babel-polyfill';

// styles
import 'amstock3/amcharts/style.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/css/font-awesome.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'angular-advanced-searchbox/dist/angular-advanced-searchbox.min.css';
import '../assets/styles/common.css';
import '../assets/styles/flags.css';
import '../assets/styles/tableMobile.css';

// submodules
import '../components/blocks';
import '../components/address';
import '../components/transactions';
import '../components/delegate';
import '../components/delegate-monitor';
import '../components/top-accounts';
import '../components/search';
import '../components/header';
import '../components/footer';
import '../components/currency-selector';
import '../components/navigation-dropdown';
import '../components/rounding-selector';
import '../components/activity-graph';
import '../components/home';
import '../components/bread-crumb';
import '../components/market-watcher';
import '../components/network-monitor';
import '../components/information-banner';

import '../filters';
import '../services';
import '../directives';
import './app-tools.module';
import '../shared';

const App = angular.module('lisk_explorer', [
	'ngAnimate',
	'ngResource',
	'ui.router',
	'ui.bootstrap',
	'gettext',
	'angular-advanced-searchbox',
	'lisk_explorer.breadCrumb',
	'lisk_explorer.filters',
	'lisk_explorer.services',
	'lisk_explorer.header',
	'lisk_explorer.footer',
	'lisk_explorer.blocks',
	'lisk_explorer.transactions',
	'lisk_explorer.address',
	'lisk_explorer.delegate',
	'lisk_explorer.topAccounts',
	'lisk_explorer.search',
	'lisk_explorer.tools',
	'lisk_explorer.currency',
	'lisk_explorer.navDropdown',
	'lisk_explorer.roundingMenu',
	'lisk_explorer.activityGraph',
	'lisk_explorer.delegateMonitor',
	'lisk_explorer.home',
	'lisk_explorer.networkMonitor',
	'lisk_explorer.marketWatcher',
	'lisk_explorer.infoBanner',
]);

export default App;
