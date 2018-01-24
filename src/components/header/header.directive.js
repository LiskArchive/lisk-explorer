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
AppHeader.directive('mainHeader', ($socket, $rootScope, Header) => {
	const HeaderLink = () => {
		$rootScope.currency = {
			symbol: 'LSK',
		};

		$rootScope.showNethash = (hash) => {
			if (typeof hash === 'string' && hash.length > 0) {
				return hash.toLowerCase() !== 'mainnet';
			}
			return false;
		};

		const header = new Header($rootScope);
		const ns = $socket('/header');

		ns.on('data', (res) => {
			if (res.status) { header.updateBlockStatus(res.status); }
			if (res.ticker) { header.updatePriceTicker(res.ticker); }
		});

		ns.on('delegateProposals', (res) => {
			if (res) { header.updateDelegateProposals(res); }
		});


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
