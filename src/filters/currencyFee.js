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

AppFilters.filter('currencyFee', (numberFilter, liskFilter) => (amount, currency, decimalPlacesCrypto, decimalPlacesFiat) => {
	const lisk = liskFilter(amount);
	let factor = 1;

	if (currency.symbol === 'LSK') {
		return numberFilter((lisk * factor), 1);
	}

	if (!decimalPlacesFiat && decimalPlacesFiat !== 0) decimalPlacesFiat = 2;

	if (currency.tickers && currency.tickers.LSK && currency.tickers.LSK[currency.symbol]) {
		factor = currency.tickers.LSK[currency.symbol];
	} else if (currency.symbol !== 'LSK') {
		// Exchange rate not available for current symbol
		return 'N/A';
	}

	const decimals = (currency.symbol === 'LSK' || currency.symbol === 'BTC') ? decimalPlacesCrypto : decimalPlacesFiat;
	if (typeof decimals === 'number' && lisk > 0) {
		return numberFilter((lisk * factor), decimals);
	}
	return numberFilter((lisk * factor), 8).replace(/\.?0+$/, '');
});
