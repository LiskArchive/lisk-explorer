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

AppFilters.filter('approval', () => (votes) => {
	if (isNaN(votes)) {
		return 0;
	}
	// (votes / 1e16) * 100
	return (parseInt(votes, 10) / 1e14).toFixed(2);
});
