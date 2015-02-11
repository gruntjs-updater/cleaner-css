/*!
 * grunt-cleaner-css
 * https://github.com/nielse63/cleaner-css
 *
 * Copyright (c) 2015 Erik Nielsen
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');
var Comb = require('csscomb');
var CleanCSS = require('clean-css');

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

	var configpath = path.normalize(path.join(__dirname, '/../defaults/.csscomb.json'));
	var config = grunt.file.readJSON(configpath);
	var comb;
	if(!grunt.file.exists(configpath)) {
		comb = new Comb('yandex');
	} else {
		comb = new Comb(config);
	}

	grunt.registerMultiTask('cleaner_css', 'Makes your clean CSS even cleaner', function() {

		var options = this.options({
			config: '.csscomb.json'
		});

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
			var minifiedContent = array.map(function(filepath) {
				var filecontent = grunt.file.read(filepath);
				if(!filecontent.length) {
					grunt.log.warn('No content in ' + path.basename(filepath));
					return;
				}
				grunt.log.ok('Cleaning ' + path.basename(filepath));
				return filecontent;
			});
			if(!minifiedContent.length) {
				grunt.fail.warn('Minification failed');
			}
			if(typeof minifiedContent != 'string') {
				minifiedContent += '';
			}

			var srcmap = getSourceMap(minifiedContent);
			minifiedContent = new CleanCSS({
				keepBreaks: true
			}).minify(minifiedContent).styles;

			if(srcmap.length) {
				minifiedContent += "\n" + srcmap;
			}
				
			minifiedContent = comb.processString(minifiedContent);
			minifiedContent = minifiedContent.replace(/,url/g, ",\n\t\t url");
			grunt.file.write(file.dest, minifiedContent);
		});
	});

};
