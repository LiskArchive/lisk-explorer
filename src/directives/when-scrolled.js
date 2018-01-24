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
import angular from 'angular';
import AppTools from '../app/app-tools.module';

AppTools.directive('whenScrolled', $window => ({
	restrict: 'A',

	link(scope, elm, attr) {
		let pageHeight;
		let clientHeight;
		let scrollPos;
		$window = angular.element($window);

		const handler = () => {
			pageHeight = window.document.documentElement.scrollHeight;
			clientHeight = window.document.documentElement.clientHeight;
			scrollPos = window.pageYOffset;

			if (pageHeight - (scrollPos + clientHeight) === 0) {
				scope.$apply(attr.whenScrolled);
			}
		};

		$window.on('scroll', handler);

		scope.$on('$destroy', () => $window.off('scroll', handler));
	},
}));
