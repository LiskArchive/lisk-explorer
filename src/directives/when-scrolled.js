import angular from 'angular';
import AppTools from '../app/app-tools.module.js';

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
