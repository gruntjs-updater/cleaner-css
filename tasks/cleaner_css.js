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

	var addNewLines = function(content)
	{
		var lines = content.split("\n");
		var output = '';
		var isInComment = false;
		var hasSpecialOpening = false;
		for(var i = 0; i < lines.length; i++) {
			var line = lines[i];
			var openingIndex = line.indexOf('/*');
			var closingIndex = line.indexOf('*/');
			var isBase64 = line.indexOf('url(') > -1;
			if(openingIndex > -1) {
				isInComment = true;
			}
			if(closingIndex > -1) {
				isInComment = false;
			}
			// Leave single-line special comments alone
			var special1 = line.indexOf('/*!');
			var special2 = line.indexOf('/*#');
			if(special1 > -1 || special2 > -1) {
				isInComment = true;
				hasSpecialOpening = true;
			}
			if(!isInComment && !hasSpecialOpening && !isBase64) {
				line = line.replace(/;/g, ";\n");
				line = line.replace(/,/g, ",\n");
				line = line.replace(/\{/g, "\{\n");
				line = line.replace(/\}/g, "\}\n");
			}
			if(!isInComment && hasSpecialOpening) {
				hasSpecialOpening = false;
			}
			output += line + "\n";
		}
		return output;
	};

	var stripComments = function(content)
	{
		var lines = content.split("\n");
		var output = '';
		var isInComment = false;
		var hasSpecialOpening = false;
		for(var i = 0; i < lines.length; i++) {
			var line = lines[i];
			var openingIndex = line.indexOf('/*') > -1;
			var closingIndex = line.indexOf('*/') > -1;
			var special = line.indexOf('/*!') > -1;
			if(!special) {
				special = line.indexOf('/*#') > -1;
			}
			if(special) {
				openingIndex = false;
				hasSpecialOpening = true;
			}
			
			// Remove inline comments
			if(openingIndex && closingIndex) {
				line = line.substring(0, openingIndex);
				line = line.substring(closingIndex + 2, line.length);
			}
			
			// Remove the first line of block comments
			if(openingIndex) {
				continue;
			}
			
			// If we're in a special-comment block and there's a closing comment, add it to the output and continue
			if(hasSpecialOpening && closingIndex) {
				output += line + "\n";
				hasSpecialOpening = false;
				continue;
			}
			
			// If there's a closing comment, remove that line
			if(closingIndex) {
				continue;
			}

			// Remove blank lines
			if(!line.length || line == '') {
				continue;
			}

			// Add the line to the output
			output += line + "\n";
		}
		return output;
	};

	grunt.registerMultiTask('cleaner_css', 'Makes your clean CSS even cleaner', function() {
		var options = this.options({
			config: '.csscomb.json'
		});

		var configpath = path.join(process.cwd(), '/defaults/.csscomb.json');
		if(grunt.file.exists(configpath)) {
			grunt.log.ok('Using default config file');
		}

		grunt.initConfig({
			csscomb: {
				options: {
					config: configpath
				}
			}
		});

		var c = 0;
		var tmpfiles = [];
		this.files.forEach(function(file) {

			var contents = file.src.filter(function(filepath) {
				if (!grunt.file.exists(filepath)) {
					grunt.log.warn('Source file "' + filepath + '" not found.');
					return false;
				} else {
					return true;
				}
			}).map(function(filepath) {
				var filecontent = grunt.file.read(filepath);
				// Add new lines after commas, semi-colons, and opening/closing braces
				filecontent = addNewLines(filecontent);

				// Strip comments
				filecontent = stripComments(filecontent);

				// Add newlines before and after block comments
				var lines = filecontent.split("\n");
				var output = '';
				for(var i = 0; i < lines.length; i++) {
					var line = lines[i].trim();
					var openingIndex = line.indexOf('/*') > -1;
					var closingIndex = line.indexOf('*/') > -1;

					// Add blank line before block comments
					if(openingIndex && i != 0) {
						var prevLine = lines[i - 1];
						if(prevLine.length) {
							line = "\n" + line;
						}
					}

					// Add blank line after block comments
					if(closingIndex) {
						var nextLine = lines[i - 1];
						if(nextLine.length) {
							line = line + "\n";
						}
					}

					output += line + "\n";
				}

				// Remove extraneous newline characters
				output = output.replace(/\n\n\n/g, "\n");

				// tmp filepath var
				var tmpfile = filepath + '._tmp.css';
				tmpfiles.push(tmpfile);

				// Write the file
				grunt.file.write(tmpfile, output);

				// Configure the comber
				var comb_property = 'csscomb.css' + c + '.files';
				var comb_value = {};
				comb_value[file.dest] = tmpfile;
				grunt.config(comb_property, comb_value);
				c++;
			});
		});

		// Run csscomb
		grunt.loadNpmTasks('grunt-csscomb');
		grunt.task.run('csscomb');

		for(var i = 0; i < tmpfiles.length; i++) {
			grunt.file.delete(tmpfiles[i]);
		}
	});
};
