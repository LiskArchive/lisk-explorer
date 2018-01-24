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
import AppMarketWatcher from './market-watcher.module';
import template from './market-watcher.html';
import './market-watcher.css';

const MarketWatcherConstructor = function (marketWatcher) {
	marketWatcher(this);
};

AppMarketWatcher.component('marketWatcher', {
	template,
	controller: MarketWatcherConstructor,
	controllerAs: 'vm',
});
