import angular from 'angular';
import AppMarketWatcher from './market-watcher.module';

const MarketWatcher = function ($q, $http, $rootScope, vm) {
	let interval;

	const updateAll = () => vm.newExchange || (!vm.newExchange && !vm.newDuration);

	const getCandles = () => {
		console.log('Retrieving candles...');
		return $http.get(['/api/exchanges/getCandles',
			'?e=', angular.lowercase(vm.exchange),
			'&d=', vm.duration].join(''));
	};

	const getStatistics = () => {
		if (!updateAll()) {
			return false;
		}
		console.log('Retrieving statistics...');
		return $http.get(['/api/exchanges/getStatistics',
			'?e=', angular.lowercase(vm.exchange)].join(''));
	};

	const getOrders = () => {
		if (!updateAll()) {
			return false;
		}
		console.log('Retrieving orders...');
		return $http.get(['/api/exchanges/getOrders',
			'?e=', angular.lowercase(vm.exchange)].join(''));
	};

	const getData = () => {
		console.log('New exchange:', vm.newExchange);
		console.log('New duration:', vm.newDuration);
		console.log('Updating all:', updateAll());

		$q.all([getCandles(), getStatistics(), getOrders()]).then((results) => {
			if (results[0] && results[0].data) {
				vm.candles = results[0].data.candles;
				$rootScope.$broadcast('$candlesUpdated');
				console.log('Candles updated');
			}
			if (results[1] && results[1].data) {
				vm.statistics = results[1].data.statistics;
				$rootScope.$broadcast('$statisticsUpdated');
				console.log('Statistics updated');
			}
			if (results[2] && results[2].data) {
				vm.orders = results[2].data.orders;
				$rootScope.$broadcast('$ordersUpdated');
				console.log('Orders updated');
			}
		});
	};

	const getExchanges = () => {
		console.log('Retrieving exchanges...');
		$http.get('/api/exchanges').then((result) => {
			if (result.data.success) {
				vm.exchangeLogos = {};
				vm.exchanges = Object.keys(result.data.exchanges).filter((key) => {
					System.import(`../../assets/img/exchanges/${key}.png`).then((value) => {
						vm.exchangeLogos[key] = value;
					});
					if (result.data.exchanges[key]) return key;
					return false;
				});

				if (vm.exchanges.length > 0) {
					vm.setExchange();
					interval = setInterval(getData, 30000);
				}
			} else {
				vm.exchanges = [];
				vm.noExchange = true;
				$rootScope.noExchange = true;
			}
		});
	};

	vm.setTab = (tab) => {
		vm.oldTab = vm.tab;
		vm.tab = tab;

		if (!vm.oldTab) { return; }
		console.log('Switched tab from', vm.oldTab, 'to', vm.tab);

		if (tab === 'stockChart' && vm.oldTab !== 'stockChart') {
			$rootScope.$broadcast('$candlesUpdated');
		} else if (tab === 'depthChart' && vm.oldTab !== 'depthChart') {
			$rootScope.$broadcast('$ordersUpdated');
		}
	};

	vm.setExchange = (exchange, duration) => {
		vm.oldExchange = vm.exchange;
		vm.exchange = (exchange || vm.exchange || vm.exchanges[0]);
		vm.newExchange = (vm.exchange !== vm.oldExchange);
		if (vm.newExchange) {
			console.log('Changed exchange from:', vm.oldExchange, 'to:', vm.exchange);
		}
		return vm.setDuration(duration);
	};

	vm.setDuration = (duration) => {
		vm.oldDuration = vm.duration;
		vm.duration = (duration || vm.duration || 'hour');
		vm.newDuration = (vm.duration !== vm.oldDuration);
		if (vm.newDuration) {
			console.log('Changed duration from:', vm.oldDuration, 'to:', vm.duration);
		}
		return getData();
	};

	getExchanges();
	vm.isCollapsed = false;

	$rootScope.$on('$locationChangeStart', () => {
		clearInterval(interval);
	});

	$rootScope.$on('$stockChartUpdated', () => {
		vm.newExchange = false;
		vm.newDuration = false;
	});
};

AppMarketWatcher.factory('marketWatcher',
	($q, $http, $socket, $rootScope) => (vm) => {
		const marketWatcher = new MarketWatcher($q, $http, $rootScope, vm);
		const ns = $socket('/marketWatcher');

		$rootScope.$on('$destroy', () => {
			ns.removeAllListeners();
		});

		$rootScope.$on('$stateChangeStart', () => {
			ns.emit('forceDisconnect');
		});

		return marketWatcher;
	});
