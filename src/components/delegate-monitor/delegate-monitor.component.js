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
import AppDelegateMonitor from './delegate-monitor.module';
import template from './delegate-monitor.html';
import './delegate-monitor.css';

const DelegateMonitorConstructor = function (delegateMonitor, orderBy, $rootScope, $http) {
	const vm = this;
	delegateMonitor(vm);

	vm.getStandby = (n) => {
		let offset = 0;

		if (n) {
			offset = (n - 1) * 20;
		}

		vm.standbyDelegates = null;

		$http.get(`/api/delegates/getStandby?n=${offset}`).then((resp) => {
			if (resp.data.success) {
				resp.data.delegates.forEach((delegate) => {
					delegate.proposal = $rootScope.delegateProposals[delegate.username.toLowerCase()];
				});

				vm.standbyDelegates = resp.data.delegates;
			}
			if (resp.data.pagination) {
				vm.pagination = resp.data.pagination;
			}
		});
	};

	vm.getStandby(1);

	vm.tables = {
		active: orderBy('rate'),
		standby: orderBy('rate'),
	};
};

AppDelegateMonitor.component('delegateMonitor', {
	template,
	controller: DelegateMonitorConstructor,
	controllerAs: 'vm',
});
