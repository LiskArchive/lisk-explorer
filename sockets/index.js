const logger = require('../utils/logger');

module.exports = function (app, io) {
	const ns = {
		header: io.of('/header'),
		activityGraph: io.of('/activityGraph'),
		delegateMonitor: io.of('/delegateMonitor'),
		marketWatcher: io.of('/marketWatcher'),
		networkMonitor: io.of('/networkMonitor'),
	};

	const header = require('./header');
	const activityGraph = require('./activityGraph');
	const delegateMonitor = require('./delegateMonitor');
	const marketWatcher = require('./marketWatcher');
	const networkMonitor = require('./networkMonitor');

	const clients = _ns => Object.keys(_ns.connected).length;

	/**
	 * @todo Which ns variable?
	 */
	const connectionHandler = function (name, _ns, object) {
		_ns.on('connection', (socket) => {
			if (clients(_ns) <= 1) {
				object.onInit();
				logger.info(name, 'First connection');
			} else {
				object.onConnect();
				logger.info(name, 'New connection');
			}
			socket.on('disconnect', () => {
				if (clients(_ns) <= 0) {
					object.onDisconnect();
					logger.info(name, 'Closed connection');
				}
			});
			socket.on('forceDisconnect', () => {
				socket.disconnect();
			});
		});
	};

	/**
	 * @todo I've used this object to eliminate no-new error
	 * Creating an instance of a constructor while not storing the results
	 * is a clear sign of side effects.
	 */
	const sideEffects = {};

	sideEffects.header = new header(app, connectionHandler, ns.header);
	sideEffects.activityGraph = new activityGraph(app, connectionHandler, ns.activityGraph);
	sideEffects.delegateMonitor = new delegateMonitor(app, connectionHandler, ns.delegateMonitor);
	sideEffects.marketWatcher = new marketWatcher(app, connectionHandler, ns.marketWatcher);
	sideEffects.networkMonitor = new networkMonitor(app, connectionHandler, ns.networkMonitor);
};

