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
      tests: ['tmp']
    },

    // Configuration to be run (and then tested).
    cleaner_css: {
      defaults: {
        options: {
        },
        files: {
          'tmp/defaults/bootstrap.css': ['test/css/bootstrap.css'],
          'tmp/defaults/ie8.css': ['test/css/ie8.css'],
          'tmp/defaults/ie9.css': ['test/css/ie9.css'],
          'tmp/defaults/jquery-ui.css': ['test/css/jquery-ui.css'],
          'tmp/defaults/main.css': ['test/css/main.css'],
          'tmp/defaults/mejs.css': ['test/css/mejs.css'],
          'tmp/defaults/multiselect.css': ['test/css/multiselect.css']
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
  grunt.registerTask('test', ['clean', 'cleaner_css', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
