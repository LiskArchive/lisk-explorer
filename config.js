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
 * CONFIGURATION
 */
config.host = '0.0.0.0'; // Interface to listen on, 0.0.0.0 to listen on all available
config.port = 6040; // Port to listen on

/**
 * Lisk Service server
 */
config.liskService = {};
config.liskService.host = process.env.LISK_SERVICE_HOST || '127.0.0.1';
config.liskService.port = process.env.LISK_SERVICE_PORT || 6041;
config.liskService.apiPath = '/api';

module.exports = config;
