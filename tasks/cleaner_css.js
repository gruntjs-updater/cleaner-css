/*!
 * grunt-cleaner-css
 * https://github.com/nielse63/cleaner-css
 *
 * Copyright (c) 2015 Erik Nielsen
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');

module.exports = function(grunt) {

	var spaceBlockComments = function(content)
	{
		var output = content.replace(/\/\*/g, "\n/*");
		output = output.replace(/\*\//g, "*/\n");
		return output;
	};

	var getSourceMap = function(content)
	{
		var openingIndex = content.indexOf('/*#');
		var hasSourceMap = openingIndex > -1;
		if(!hasSourceMap) {
			return '';
		}
		return content.substring(openingIndex, content.length).trim();
	};

	grunt.registerMultiTask('cleaner_css', 'Makes your clean CSS even cleaner', function() {

		var options = this.options({
			config: '.csscomb.json'
		});

		// Register dependent tasks
		grunt.initConfig({
			cssmin : {
				combine: {
					options : {
						compatibility : '*',
						keepBreaks : true,
						keepSpecialComments : 0,
						restructuring : false
					},
					files : this.files
				}
			},
		});
		grunt.loadNpmTasks('grunt-contrib-cssmin');

		var c = 0,
			count = this.files.count;
		var comb_files = {};
		this.files.forEach(function(file) {

			var valid = file.src.filter(function(filepath) {
				if(!grunt.file.exists(filepath)) {
					grunt.log.warn('Source file "' + filepath + '" not found.');
					return false;
				} else {
					return true;
				}
			});
			var array = valid.map(function(filepath) {
				if(grunt.file.isDir(filepath)) {
					var array = [];
					grunt.file.recurse(filepath, function(abspath, rootdir, subdir, filename) {
						array.push(abspath);
					});
					return array;
				} else {
					return [filepath];
				}
			});
			var originalContent = array.map(function(filepath) {
				var filecontent = grunt.file.read(filepath);
				if(!filecontent.length) {
					grunt.log.warn('No content in ' + path.basename(filepath));
					return;
				}
				grunt.log.ok('Cleaning ' + path.basename(filepath));
				return filecontent;
			});
			if(!originalContent.length) {
				grunt.fail.warn('Cleaning failed - no content in file.');
			}
			if(typeof originalContent != 'string') {
				originalContent += '';
			}

			var contentArray = originalContent.split("\n");
			var output = '';
			for(var i = 0; i < contentArray.length; i++) {
				var line = contentArray[i].trim();
				if(line == ';' || line.indexOf('-lh-property') > -1 || line.indexOf('lesshat-selector') > -1) {
					continue;
				}
				output += line + "\n";
			}
			var content = output;

			grunt.file.write(file.dest, content);
		});
	});

};
