/*
* grunt-cleaner-css
* https://github.com/nielse63/cleaner-css
*
* Copyright (c) 2015 Erik Nielsen
* Licensed under the MIT license.
*/

'use strict';

module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		jshint: {
			all: [
			'Gruntfile.js',
			'tasks/*.js',
			'<%= nodeunit.tests %>'
			],
			options: {
				jshintrc: '.jshintrc'
			}
		},

		// Before generating any new files, remove any previously-created files.
		clean: {
			tests: ['tmp/output']
		},

		// Configuration to be run (and then tested).
		cleaner_css: {
			default: {
				options: {
				},
				files: {
					// 'tmp/output/bootstrap.css': ['tmp/input/bootstrap.css'],
					// 'tmp/output/ie8.css': ['tmp/input/ie8.css'],
					'tmp/output/2.css': ['tmp/input/2.css'],
					// 'tmp/output/jquery-ui.css': ['tmp/input/jquery-ui.css'],
					// 'tmp/output/main.css': ['tmp/input/main.css'],
					// 'tmp/output/mejs.css': ['tmp/input/mejs.css'],
					// 'tmp/output/multiselect.css': ['tmp/input/multiselect.css']
				}
			}
		},

		// Unit tests.
		nodeunit: {
			tests: ['test/*_test.js']
		}

	});

	// Actually load this plugin's task(s).
	grunt.loadTasks('tasks');

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-nodeunit');

	// Whenever the "test" task is run, first clean the "tmp" dir, then run this
	// plugin's task(s), then test the result.
	grunt.registerTask('test', ['clean', 'cleaner_css']);

	// By default, lint and run all tests.
	grunt.registerTask('default', ['jshint', 'test']);

};
