import io from 'socket.io-client';
import AppServices from './services.module';


/**
 * @todo isolate socket.io
 */
AppServices.factory('$socket',
	($location, $rootScope) => (namespace) => {
		const socket = io(`${$location.host()}:${$location.port()}${namespace}`, { forceNew: true });

		return {
			on(eventName, callback) {
				socket.on(eventName, (...args) => {
					$rootScope.$apply(() => {
						callback.apply(socket, args);
					});
				});
			},

			emit(eventName, data, callback) {
				socket.emit(eventName, data, (...args) => {
					$rootScope.$apply(() => {
						if (callback) {
							callback.apply(socket, args);
						}
					});
				});
			},

			removeAllListeners(eventName, callback) {
				socket.removeAllListeners(eventName, (...args) => {
					$rootScope.$apply(() => {
						callback.apply(socket, args);
					});
				});
			},
		};
	});
