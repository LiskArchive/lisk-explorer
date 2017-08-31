import Clipboard from 'clipboard';
import AppTools from '../app/app-tools.module.js';

AppTools.directive('clipCopy', () => ({
	restric: 'A',
	scope: { clipCopy: '=clipCopy' },
	template: '<div class="tooltip fade right in"><div class="tooltip-arrow"></div><div class="tooltip-inner">{{tooltipText}}</div></div>',
	link(scope, elm) {
		scope.tooltipText = 'Copied!';
		const clip = new Clipboard(elm[0], {
			// eslint-disable-next-line no-unused-vars
			text: target => scope.clipCopy,
		});
		clip.on('success', () => {
			elm.addClass('active');
		});
		elm.on('mouseleave', () => {
			elm.removeClass('active');
		});
		clip.on('error', () => {
			scope.tooltipText = 'Press Ctrl+C to copy!';
			scope.$apply();
			elm.addClass('active');
		});
		scope.$on('$destroy', () => clip.destroy());
	},
}));
