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

AppFilters.filter('supplyPercent', () => (amount, supply) => {
	const supplyCheck = (supply > 0);
	if (isNaN(amount) || !supplyCheck) {
		return (0).toFixed(2);
	}
	return ((amount / supply) * 100).toFixed(2);
});
