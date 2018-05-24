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
import Clipboard from 'clipboard';
import AppTools from '../app/app-tools.module';

AppTools.directive('clipCopy', () => ({
	restric: 'A',
	scope: { clipCopy: '=clipCopy' },
	template: '<div data-ng-if="tooltipText" class="tooltip fade top in"><div class="tooltip-arrow"></div><div class="tooltip-inner">{{tooltipText}}</div></div>',
	link(scope, elm, attrs) {
		const clip = new Clipboard(elm[0], {
			text: () => scope.clipCopy,
		});

		clip.on('success', () => {
			scope.tooltipText = attrs.tooltipLabel || 'Copied!';
			scope.$apply();
			elm.addClass('active');
		});

		elm.on('mouseleave', () => {
			elm.removeClass('active');
			scope.tooltipText = null;
		});

		clip.on('error', () => {
			scope.tooltipText = 'Press Ctrl+C to copy!';
			scope.$apply();
			elm.addClass('active');
		});

		if (attrs.onHover) {
			elm.on('mouseenter', () => {
				scope.tooltipText = attrs.onHover;
				scope.$apply();
				elm.addClass('active');
			});
		}

		scope.$on('$destroy', () => clip.destroy());
	},
}));
