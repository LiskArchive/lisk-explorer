import AppServices from './services.module';


/**
 * @todo isolate socket.io
 * @todo why sicket is not mounted in bundle?
 */
AppServices.factory('$socket',
	($location, $rootScope) => (namespace) => {
		const socket = io(`${$location.host()}:${$location.port()}${namespace}`, { forceNew: true });

		return {
			on(eventName, callback) {
				socket.on(eventName, function () {
					const args = arguments;

					$rootScope.$apply(() => {
						callback.apply(socket, args);
					});
				});
			},

			emit(eventName, data, callback) {
				socket.emit(eventName, data, function () {
					const args = arguments;

					$rootScope.$apply(() => {
						if (callback) {
							callback.apply(socket, args);
						}
					});
				});
			},

			removeAllListeners(eventName, callback) {
				socket.removeAllListeners(eventName, function () {
					const args = arguments;

					$rootScope.$apply(() => {
						callback.apply(socket, args);
					});
				});
			},
		};
	});
