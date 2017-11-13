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
