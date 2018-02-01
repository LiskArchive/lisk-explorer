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
import AppTools from '../../app/app-tools.module';

const osIcon = AppTools.directive('osIcon', () => ({
	restrict: 'A',

	scope: {
		os: '=os',
		brand: '=brand',
	},

	template: '<span></span>',
	replace: true,

	link(scope, element) {
		const el = element[0];

		el.alt = scope.os;
		el.title = scope.os;
		el.className += (` os-icon os-${scope.brand.name}`);
	},
}));

export default osIcon;
