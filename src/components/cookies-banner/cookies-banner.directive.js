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
import CookiesBanner from './cookies-banner.module';
import template from './cookies-banner.html';

const directiveCtrl = ($scope, $cookies) => {
	$scope.visible = true;
	const cookieKey = 'cookiesBannerConfirmed';

	$scope.clicked = () => {
		$scope.visible = false;
		$cookies.put(cookieKey, 'true');
	};

	const result = $cookies.get(cookieKey);
	if (result === 'true') $scope.visible = false;
};

// eslint-disable-next-line arrow-body-style
CookiesBanner.directive('cookiesBanner', () => {
	return {
		restrict: 'E',
		replace: true,
		scope: true,
		template,
		controller: directiveCtrl,
		controllerAs: 'vm',
	};
});
