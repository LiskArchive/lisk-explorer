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
module.exports = function (grunt) {
	// Load NPM Tasks
	grunt.loadNpmTasks('grunt-markdown');
	grunt.loadNpmTasks('grunt-mocha-test');

	// Load Custom Tasks
	grunt.loadTasks('tasks');

	// Project Configuration
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		mochaTest: {
			test: {
				options: {
					reporter: 'spec',
					quiet: false,
					clearRequireCache: false,
					noFail: false,
					timeout: '250s',
				},
				src: ['test'],
			},
		},
		markdown: {
			all: {
				files: [
					{
						expand: true,
						src: 'README.md',
						dest: '.',
						ext: '.html',
					},
				],
			},
		},
	});

	// Register tasks for travis.
	grunt.registerTask('test', ['mochaTest']);
};
