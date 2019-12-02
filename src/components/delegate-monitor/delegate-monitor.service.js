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

const DelegateMonitor = function ($scope, $rootScope, forgingMonitor) {
	const bestForger = (delegates) => {
		let delegate;
		if (delegates.length > 0) {
			delegate = delegates.reduce((d1, d2) =>
				(parseInt(d1.forged, 10) > parseInt(d2.forged, 10) ? d1 : d2));
		}
		return delegate;
	};

	const totalForged = delegates => delegates
		.map(d => parseInt(d.forged, 10))
		.reduce((memo, num) => parseInt(memo, 10) + parseInt(num, 10), 0);

	const bestProductivity = (delegates) => {
		let delegate;
		if (delegates.length > 0) {
			delegate = delegates.reduce((d1, d2) => ((d1.productivity > d2.productivity) ? d1 : d2));
		}
		return delegate;
	};

	const worstProductivity = (delegates) => {
		let delegate;
		if (delegates.length > 0) {
			delegate = delegates.reduce((d1, d2) => ((d1.productivity < d2.productivity) ? d1 : d2));
		}
		return delegate;
	};

	const updateForgingTotals = (delegates) => {
		$scope.forgingTotals = forgingMonitor.getForgingTotals(delegates);
	};

	const updateForgingProgress = (totals) => {
		totals.processed = forgingMonitor.getForgingProgress(totals);

		if (totals.processed > 0) {
			$scope.forgingProgress = true;
		}
	};

	this.updateActive = (active) => {
		active.delegates.forEach((d) => {
			d.forgingStatus = forgingMonitor.getStatus(d);
		});
		$scope.activeDelegates = active.delegates;

		updateForgingTotals(active.delegates);
		updateForgingProgress($scope.forgingTotals);
	};

	this.updateTotals = (active) => {
		$scope.totalDelegates = active.totalCount || 0;
		$scope.totalActive = 39;

		if ($scope.totalDelegates > $scope.totalActive) {
			$scope.totalStandby = ($scope.totalDelegates - $scope.totalActive);
		} else {
			$scope.totalStandby = 0;
		}

		$scope.bestForger = bestForger(active.delegates);
		$scope.totalForged = totalForged(active.delegates);
		$scope.bestProductivity = bestProductivity(active.delegates);
		$scope.worstProductivity = worstProductivity(active.delegates);
	};

	this.updateLastBlock = (lastBlock) => {
		$scope.lastBlock = lastBlock.block;
	};

	this.updateRegistrations = (registrations) => {
		$scope.registrations = registrations.transactions;
	};

	this.updateNextForgers = (nextForgers) => {
		$scope.nextForgers = nextForgers;
	};

	this.updateVotes = (votes) => {
		$scope.votes = votes.transactions;
	};

	this.updateApproval = (approval) => {
		$scope.approval = approval;
	};

	this.updateLastBlocks = (delegate) => {
		$scope.activeDelegates.forEach((d) => {
			d.forgingStatus = forgingMonitor.getStatus(d);
		});

		let found = false;
		const existing = $scope.activeDelegates.filter((d) => {
			if (!found && (d.publicKey === delegate.publicKey)) {
				found = true;
				return true;
			}
			return false;
		})[0];
		if (existing) {
			existing.blocksAt = delegate.blocksAt;
			existing.blocks = delegate.blocks;
			existing.forgingStatus = forgingMonitor.getStatus(delegate);
		}
		updateForgingTotals($scope.activeDelegates);
		updateForgingProgress($scope.forgingTotals);
	};
};

AppDelegateMonitor.factory('delegateMonitor',
	($socket, $rootScope, forgingMonitor) => (vm) => {
		const delegateMonitor = new DelegateMonitor(vm, $rootScope, forgingMonitor);
		const ns = $socket('/delegateMonitor');

		ns.on('data', (res) => {
			if (res.active) {
				delegateMonitor.updateActive(res.active);
				delegateMonitor.updateTotals(res.active);
			}
			if (res.lastBlock) { delegateMonitor.updateLastBlock(res.lastBlock); }
			if (res.registrations) { delegateMonitor.updateRegistrations(res.registrations); }
			if (res.nextForgers) { delegateMonitor.updateNextForgers(res.nextForgers); }
			if (res.votes) { delegateMonitor.updateVotes(res.votes); }
			if (res.approval) { delegateMonitor.updateApproval(res.approval); }
		});

		ns.on('delegate', (res) => {
			if (res.publicKey) {
				delegateMonitor.updateLastBlocks(res);
			}
		});

		$rootScope.$on('$destroy', () => {
			ns.removeAllListeners();
		});

		$rootScope.$on('$stateChangeStart', () => {
			ns.emit('forceDisconnect');
		});

		return delegateMonitor;
	},
);
