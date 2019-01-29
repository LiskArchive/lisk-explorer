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
import AppHeader from './header.module';
import template from './header.html';
import './header.css';
/**
 *
 * @todo Fix the service usage
 *
 */
AppHeader.directive('mainHeader', ($socket, $rootScope, Header, $timeout) => {
	const HeaderLink = () => {
		$rootScope.currency = {
			symbol: 'LSK',
		};

		$rootScope.connected = true;
		$rootScope.connectionErrorMsg = false;
		$rootScope.connectionMsg = false;

		$rootScope.showNethash = (hash) => {
			if (typeof hash === 'string' && hash.length > 0) {
				return hash.toLowerCase() !== 'mainnet';
			}
			return false;
		};

		const header = new Header($rootScope);
		const ns = $socket('/header');

		ns.on('data', (res) => {
			if (res.status) {
				header.updateBlockStatus(res.status);
				$rootScope.connected = true;
			}
			if (res.ticker) { header.updatePriceTicker(res.ticker); }
		});

		const events = ['connect', 'connect_error', 'error', 'disconnect', 'reconnect', 'reconnect_error', 'reconnect_failed'];

		const registerSocketEvents = (arr) => {
			arr.forEach((e) => {
				ns.on(e, () => {
					if (e === 'connect') {
						$rootScope.connected = true;
					} else if (e === 'reconnect') {
						$rootScope.connectionMsg = true;
						$timeout(() => $rootScope.connectionMsg = false, 2000);
					} else if (e === 'disconnect') {
						$timeout(() => $rootScope.connectionErrorMsg = true, 5000);
						$timeout(() => $rootScope.connectionErrorMsg = false, 7000);
						$timeout(() => $rootScope.connected = false, 5000);
					} else {
						$timeout(() => $rootScope.connected = false, 5000);
					}
				});
			});
		};

		registerSocketEvents(events);

		$rootScope.$on('$destroy', () => {
			ns.removeAllListeners();
		});
	};

	return {
		restrict: 'E',
		replace: true,
		link: HeaderLink,
		template,
	};
});
