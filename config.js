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
const config = {};

/**
 * Frontend UI Message
 */
config.uiMessage = {};
config.uiMessage.text = process.env.UI_MESSAGE || '';
config.uiMessage.start = process.env.UI_MESSAGE_START || ''; // optional, ISO Date-Time ex. '2018-07-11T15:01:00+02:00'
config.uiMessage.end = process.env.UI_MESSAGE_END || ''; // optional, ISO Date-Time ex. '2018-07-11T15:01:00+02:00'

/**
 * IP and TCP port to listen on
 */
config.host = process.env.HOST || '0.0.0.0'; // Interface to listen on, 0.0.0.0 to listen on all available
config.port = process.env.PORT || 6040; // Port to listen on

/**
 * Lisk Service server endpoint
 */
config.apiUrl = process.env.SERVICE_ENDPOINT || 'http://localhost:9901';
config.logLevel = 'warn'; // ['debug', 'info', 'warn', 'error', 'silent']

/**
 * Logging
 */
config.log = {};
// Collect logs (true - enabled, false - disabled)
config.log.enabled = true;
// Output for logs - can be device file or ordinary path
config.log.output = ['/dev/stdout', './logs/explorer.log'];
// Log level - (trace, debug, info, warn, error)
config.log.level = process.env.LOG_LEVEL || 'info';

module.exports = config;
