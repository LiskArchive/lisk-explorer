

module.exports = function (grunt) {
	// Load NPM Tasks
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-markdown');
	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-eslint');

	// Load Custom Tasks
	grunt.loadTasks('tasks');

	// Project Configuration
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: {
			options: {
				process(src, filepath) {
					if (filepath.substr(filepath.length - 2) === 'js') {
						return `// Source: ${filepath}\n${
							src.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1')}`;
					}
					return src;
				},
			},
		},
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
		eslint: {
			target: [
				'lib/**/*.js',
			],
		},
	});

	// Register tasks for travis.
	grunt.registerTask('travis', ['mochaTest']);
	grunt.registerTask('lint', ['eslint']);
};
