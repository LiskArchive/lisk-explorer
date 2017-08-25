

const logger = require('../utils/logger');

module.exports = function (app, io) {
	const ns = {
		header: io.of('/header'),
		activityGraph: io.of('/activityGraph'),
		delegateMonitor: io.of('/delegateMonitor'),
		marketWatcher: io.of('/marketWatcher'),
		networkMonitor: io.of('/networkMonitor'),
	};

	let header = require('./header'),
		activityGraph = require('./activityGraph'),
		delegateMonitor = require('./delegateMonitor'),
		marketWatcher = require('./marketWatcher'),
		networkMonitor = require('./networkMonitor');

	const connectionHandler = function (name, ns, object) {
		ns.on('connection', (socket) => {
			if (clients() <= 1) {
				object.onInit();
				logger.info(name, 'First connection');
			} else {
				object.onConnect();
				logger.info(name, 'New connection');
			}
			socket.on('disconnect', () => {
				if (clients() <= 0) {
					object.onDisconnect();
					logger.info(name, 'Closed connection');
				}
			});
			socket.on('forceDisconnect', () => {
				socket.disconnect();
			});
		});

		// Private

		var clients = function () {
			return Object.keys(ns.connected).length;
		};
	};

	new header(app, connectionHandler, ns.header);
	new activityGraph(app, connectionHandler, ns.activityGraph);
	new delegateMonitor(app, connectionHandler, ns.delegateMonitor);
	new marketWatcher(app, connectionHandler, ns.marketWatcher);
	new networkMonitor(app, connectionHandler, ns.networkMonitor);
};

