import angular from 'angular';
import AppTools from '../app/app-tools.module';

AppTools.directive('scroll', $window => (scope) => {
	angular.element($window).bind('scroll', function () {
		if (this.pageYOffset >= 200) {
			scope.secondaryNavbar = true;
		} else {
			scope.secondaryNavbar = false;
		}
		scope.$apply();
	});
});
