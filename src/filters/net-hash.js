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

/**
 * @todo check the possibility of removing hard coded hashes
 */
AppFilters.filter('nethash', () => (nethash) => {
	if (nethash === 'da3ed6a45429278bac2666961289ca17ad86595d33b31037615d4b8e8f158bba') {
		return 'Testnet';
	} else if (nethash === 'ed14889723f24ecc54871d058d98ce91ff2f973192075c0155ba2b7b70ad2511') {
		return 'Mainnet';
	}
	return 'Local';
});
