import AppHeader from './header.module';

const HeaderConstructor = function ($rootScope) {
	this.updateBlockStatus = (res) => {
		if (res.success) {
			$rootScope.blockStatus = {
				height: res.height,
				fee: res.fee,
				milestone: res.milestone,
				reward: res.reward,
				supply: res.supply,
				nethash: res.nethash,
			};
		}
	};

	this.updatePriceTicker = (res) => {
		if (res.success) {
			$rootScope.currency.tickers = res.tickers;
		}

		// When ticker for user-stored currency is not available - switch to LSK temporarily
		if ($rootScope.currency.symbol !== 'LSK' &&
			(!$rootScope.currency.tickers ||
			!$rootScope.currency.tickers.LSK ||
			!$rootScope.currency.tickers.LSK[$rootScope.currency.symbol])) {
			$rootScope.currency.symbol = 'LSK';
		}
	};

	// @todo shouldn't this be in run instead of header?
	$rootScope.delegateProposals = {};
	this.updateDelegateProposals = (res) => {
		$rootScope.delegateProposals = {};
		if (res.success) {
			res.proposals.forEach((proposal) => {
				$rootScope.delegateProposals[proposal.name.toLowerCase()] = proposal;
			});
		}
	};

	return this;
};

// eslint-disable-next-line no-unused-vars
AppHeader.factory('Header', $rootScope => HeaderConstructor);
