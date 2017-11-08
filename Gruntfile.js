

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
