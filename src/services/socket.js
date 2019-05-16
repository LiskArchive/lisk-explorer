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
import io from 'socket.io-client';
import AppServices from './services.module';


/**
 * @todo isolate socket.io
 */
AppServices.factory('$socket',
	$rootScope => (namespace) => {
		const socket = io(namespace, { forceNew: true, transports: ['websocket'] });

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
