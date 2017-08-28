const safeStringify = require('fast-safe-stringify');
const fs = require('fs');
const flatstr = require('flatstr');
const newConsole = require('console').Console;
const config = require('../config');

const output = fs.createWriteStream(config.log.file, { flags: 'a' });
const myConsole = new newConsole(output, output);

const levels = {
	trace: 0,
	debug: 1,
	info: 2,
	warn: 3,
	error: 4,
};

const logger = {};

logger.doLog = function doLog(level, msg, extra) {
	if (config.log.enabled) {
		const timestamp = Date.now();

		// const stringMsg = typeof msg === 'string' ? msg : JSON.stringify(msg);
		// const parsedMsg = stringMsg.replace(/(\r\n|\n|\r)/gm, ' ');

		if (extra) {
			const stringExtra = typeof extra === 'string' ? extra : JSON.stringify(extra);
			const parsedExtra = stringExtra.replace(/(\r\n|\n|\r)/gm, ' ');
			myConsole.log(flatstr(safeStringify({
				level,
				timestamp,
				message: `${msg} ${parsedExtra}`,
			})));
		} else {
			myConsole.log(flatstr(safeStringify({
				level,
				timestamp,
				message: msg,
			})));
		}
	}
};

logger.trace = function trace(msg, extra) {
	if (levels[config.log.level] <= 0) {
		logger.doLog('TRACE', msg, extra);
	}
};

logger.debug = function debug(msg, extra) {
	if (levels[config.log.level] <= 1) {
		logger.doLog('DEBUG', msg, extra);
	}
};

logger.info = function info(msg, extra) {
	if (levels[config.log.level] <= 2) {
		logger.doLog('INFO', msg, extra);
	}
};

logger.warn = function warn(msg, extra) {
	if (levels[config.log.level] <= 3) {
		logger.doLog('WARN', msg, extra);
	}
};

logger.error = function error(msg, extra) {
	if (levels[config.log.level] <= 4) {
		logger.doLog('ERROR', msg, extra);
	}
};

module.exports = logger;
