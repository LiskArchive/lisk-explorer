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
import AppRounding from './rounding-selector.module';
import template from './rounding-selector.html';

AppRounding.directive('roundingSelector', ($rootScope) => {
	const RoundingSelectorLink = () => {
	};

	const RoundingSelectorCtrl = function () {
		this.setDecimalPlaces = (setting) => {
			$rootScope.decimalPlaces = setting;
			$rootScope.isCollapsed = true;
		};
	};

	return {
		restrict: 'E',
		replace: true,
		controller: RoundingSelectorCtrl,
		controllerAs: 'cs',
		link: RoundingSelectorLink,
		template,
	};
});
