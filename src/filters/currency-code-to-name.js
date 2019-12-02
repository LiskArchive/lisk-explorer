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
import AppFilters from './filters.module';

AppFilters.filter('currencyCodeToName', () => (currencyName) => {
	const currency = {
		LSK: 'Lisk',
		LSH: 'Leasehold',
		// Common
		USD: 'US Dollar',
		EUR: 'Euro',
		BTC: 'Bitcoin',

		// Europe
		GBP: 'British pound',
		PLN: 'Polish zloty',
		RUB: 'Russian ruble',

		// Asia
		JPY: 'Japanese yen',
		CNY: 'Chinese yuan',
	};

	return currency[currencyName] || currencyName;
});
