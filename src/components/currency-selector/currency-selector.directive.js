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
import AppCurrency from './currency-selector.module';
import template from './currency-selector.html';

AppCurrency.directive('currencySelector', ($rootScope, $timeout) => {
	const CurrencySelectorLink = () => {
		$timeout(() => {
			$rootScope.currency.symbol = (localStorage && localStorage.getItem('lisk_explorer-currency')) || 'LSK';
		});
	};

	const CurrencySelectorCtrl = function ($scope) {
		$scope.tickers = {};

		this.setCurrency = (currency) => {
			$rootScope.currency.symbol = currency;
			$rootScope.isCollapsed = true;

			if (localStorage) {
				localStorage.setItem('lisk_explorer-currency', currency);
			}
		};

		$scope.$watch('currency.tickers.LSK',
			(tickers) => {
				const getTickers = list => list.filter(code => tickers[code])
					.map((code) => { // eslint-disable-line arrow-body-style
						return { code, value: tickers[code] };
					});

				if (tickers && typeof tickers === 'object') {
					$scope.tickers = {
						Popular: getTickers(['BTC', 'USD', 'EUR']),
						Europe: getTickers(['GBP', 'RUB', 'PLN']),
						Asia: getTickers(['CNY', 'JPY']),
					};
				}
			});
	};

	return {
		restrict: 'E',
		replace: true,
		controller: CurrencySelectorCtrl,
		controllerAs: 'cs',
		link: CurrencySelectorLink,
		template,
	};
});
