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
import AppTopAccounts from './top-accounts.module';
import template from './top-accounts.html';

const TopAccountsConstructor = function (lessMore) {
	this.topAccounts = lessMore({
		url: '/api/getTopAccounts',
		key: 'accounts',
	});

	this.topAccounts.loadData();
};

AppTopAccounts.component('topAccounts', {
	template,
	controller: TopAccountsConstructor,
	controllerAs: 'vm',
});
