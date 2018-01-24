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
exports.config = {
	specs: [
		'features/*.feature',
	],

	directConnect: true,
	capabilities: {
		browserName: 'chrome',
	},
	framework: 'custom',
	frameworkPath: require.resolve('protractor-cucumber-framework'),

	cucumberOpts: {
		require: 'features/step_definitions/*.js',
		tags: '~@ignore',
		format: 'pretty',
		profile: false,
		'no-source': true,
	},

	params: {
		screenshotFolder: 'e2e-test-screenshots',
		baseURL: 'http://localhost:6040',
		liskCoreURL: 'http://localhost:4000',
	},
};
