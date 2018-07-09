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
import InformationBanner from './information-banner.module';
import template from './information-banner.html';

const directiveCtrl = ($scope, $http) => {
	$scope.text = '';

	$http.get('/api/ui_message').then((result) => {
		if (result.data.success && result.data.content) {
			$scope.text = result.data.content;
		}
	});
};

// eslint-disable-next-line arrow-body-style
InformationBanner.directive('infoBanner', () => {
	return {
		restrict: 'E',
		replace: true,
		scope: true,
		template,
		controller: directiveCtrl,
		controllerAs: 'vm',
	};
});
