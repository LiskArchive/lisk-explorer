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
import config from '../../config';

App.run((
	$rootScope,
	$state,
	$location,
	$stateParams,
	$anchorScroll,
	$http,
	gettextCatalog,
	$transitions,
) => {
	gettextCatalog.currentLanguage = 'en';
	$rootScope.serviceBaseUrl = config.liskService.baseUrl;
	$rootScope.apiBaseUrl = config.liskService.apiUrl;

	$transitions.onSuccess({ to: '*' }, () => {
		$rootScope.titleDetail = '';
		$rootScope.title = $state.current.title;
		$rootScope.isCollapsed = true;

		// Market Watcher
		$http.get(`${$rootScope.apiBaseUrl}/exchanges`).then((result) => {
			if (result.data.success && result.data.enabled) {
				$rootScope.marketWatcher = true;
			}
		});

		$location.hash($stateParams.scrollTo);
		$anchorScroll();
	});

	$http.get(`${$rootScope.apiBaseUrl}/nodeConstants`).then((result) => {
		if (result && result.data) {
			$rootScope.nodeConstants = result.data;
		}
	});
});
