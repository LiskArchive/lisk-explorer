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
const safeStringify = require('fast-safe-stringify');
const fs = require('fs');
const flatstr = require('flatstr');
const newConsole = require('console').Console;
const config = require('../config');

const defaultOutput = '/dev/stdout';

if (!Array.isArray(config.log.output)) {
	if (typeof config.log.output === 'string') {
		config.log.output = [config.log.output];
	} else if (typeof config.log.file === 'string') {
		config.log.output = [config.log.file];
	} else {
		config.log.output = [defaultOutput];
	}
}

const logOutputs = config.log.output.map((outputPath) => {
	const fileOutput = fs.createWriteStream(outputPath, { flags: 'a' });
	return new newConsole(fileOutput, fileOutput);
});

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
		let outputString;

		if (extra) {
			const stringExtra = typeof extra === 'string' ? extra : JSON.stringify(extra);
			const parsedExtra = stringExtra.replace(/(\r\n|\n|\r)/gm, ' ');
			outputString = `${msg} ${parsedExtra}`;
		} else {
			outputString = msg;
		}

		logOutputs.map((logOutput) => {
			logOutput.log(flatstr(safeStringify({
				level,
				timestamp,
				message: outputString,
			})));
			return logOutput;
		});
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
