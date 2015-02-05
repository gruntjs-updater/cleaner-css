/*
 * grunt-cleaner-css
 * https://github.com/nielse63/cleaner-css
 *
 * Copyright (c) 2015 Erik Nielsen
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');
var CleanCSS = require('clean-css');
var chalk = require('chalk');
var maxmin = require('maxmin');

module.exports = function(grunt) {

	var minify = function(source, options) {
		try {
			return new CleanCSS(options).minify(source);
		} catch (err) {
			grunt.log.error(err);
			grunt.fail.warn('CSS minification failed.');
		}
	};

	grunt.registerMultiTask('cleaner_css', 'Makes your clean CSS even cleaner', function() {
		var options = this.options({
			cssmin : {
				keepBreaks: true,
				keepSpecialComments: true
			},
			comb : {
				config: '.csscomb.json'
			}
		});

		this.files.forEach(function(f) {

			/*
				cssmin
			*/
			var valid = file.src.filter(function(filepath) {
				if (!grunt.file.exists(filepath)) {
					grunt.log.warn('Source file ' + chalk.cyan(filepath) + ' not found.');
					return false;
				} else {
					return true;
				}
			});
			var max = '';
			var min = valid.map(function(file) {
				var src = grunt.file.read(file);
				max += src;
				options.relativeTo = path.dirname(file);
				return minify(src, options);
			}).join('');
			if (min.length === 0) {
				return grunt.log.warn('Destination not written because minified CSS was empty.');
			}
			if (options.banner) {
				min = options.banner + grunt.util.linefeed + min;
			}
			grunt.file.write(file.dest, min);
			grunt.log.writeln('File ' + chalk.cyan(file.dest) + ' created: ' + maxmin(max, min, options.report === 'gzip'));
		});
	});
};
