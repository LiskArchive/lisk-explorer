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
import AppDelegate from './delegate.module';
import template from './delegate.html';

const DelegateConstructor = function ($rootScope, $stateParams,
	$location, $http, $state) {
	const vm = this;

	$rootScope.breadCrumb = { address: $stateParams.delegateId };

	vm.getAddress = () => {
		$http.get(`${$rootScope.apiBaseUrl}/getAccount`, {
			params: {
				address: $stateParams.delegateId,
			},
		}).then((resp) => {
			if (resp.data.success) {
				vm.address = resp.data;

				if (!vm.address.delegate) {
					$state.go('address', { address: $stateParams.delegateId });
				}
			} else {
				$state.go('home');
			}
		}).catch(() => {
			$location.path('/');
		});
	};

	vm.getAddress();
};

AppDelegate.component('delegate', {
	template,
	controller: DelegateConstructor,
	controllerAs: 'vm',
});
