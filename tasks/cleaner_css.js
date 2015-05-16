/*!
 * grunt-cleaner-css
 * https://github.com/nielse63/cleaner-css
 *
 * Copyright (c) 2015 Erik Nielsen
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');
var chalk = require('chalk');
var CleanCSS = require('clean-css');
var css = require('css');
var Comb = require('csscomb');

module.exports = function(grunt) {

	var getAvailableFiles = function (filesArray) {
		return filesArray.filter(function (filepath) {
			if (!grunt.file.exists(filepath)) {
				grunt.log.warn('Source file ' + chalk.cyan(filepath) + ' not found');
				return false;
			} else {
				return true;
			}
		});
	};

	var getContentArray = function(content)
	{
		var array = content.split("\n");
		var output = [];
		for(var i = 0; i < array.length; i++) {
			var line = array[i];
			output.push(line);
		}
		return output;
	};

	var parseLines = function(array) {
		var output = '';
		for(var i = 0; i < array.length; i++) {
			var line = array[i].replace('};', '}');
			if(line.trim() == ';' || line.trim().indexOf('/*# source') > -1) {
				continue;
			}
			output += line + "\n";
		}
		return output;
	};

	var parseCSS = function(array) {
		var output = [];
		for(var i = 0; i < array.length; i++) {
			var rule = array[i];
			if(rule.selectors && rule.selectors.indexOf('lesshat-selector') > -1) {
				continue;
			}
			output.push(rule);
		}
		return output;
	};

	grunt.registerMultiTask('cleaner_css', 'Makes your clean CSS even cleaner', function() {

		var options = this.options({
			min : {
				keepBreaks : true,
				mediaMerging : true
			},
			comb : {
				config : path.resolve(path.join(process.cwd(), 'defaults', '.csscomb.json'))
			}
		});

		// Overwrite `keepBreaks` cssmin option in case user inputs `false`
		options.min.keepBreaks = true;
		
		var comb = new Comb(grunt.file.exists(options.comb.config) ? grunt.file.readJSON(options.comb.config) : 'yandex');

		this.files.forEach(function(file) {

			var files = getAvailableFiles(file.src);
			for(var i = 0; i < files.length; i++) {

				grunt.log.ok('Cleaning file ' + path.basename(files[i]));

				// Get initial content
				var thisFile = path.resolve(files[i]);
				var contentString = grunt.file.read(thisFile);
				var contentArray = getContentArray(contentString);
				var content = parseLines(contentArray);

				// Parse & write CSS
				var cssContent = css.parse(content, thisFile);

				cssContent.stylesheet.rules = parseCSS(cssContent.stylesheet.rules);

				// Minify
				content = css.stringify(cssContent);
				var minifiedCSS = new CleanCSS(options.min).minify(content);

				// Comb
				var syntax = thisFile.split('.').pop();
				var combed = comb.processString(minifiedCSS.styles, { syntax : syntax });
				grunt.file.write(file.dest, combed);
			}
		});
	});
};
