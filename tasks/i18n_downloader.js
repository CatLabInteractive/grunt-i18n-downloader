/*
* grunt-i18n-downloader
* https://github.com/CatLabInteractive/grunt-i18n-downloader
*
* Copyright (c) 2015 Thijs Van der Schaeghe
* Licensed under the MIT license.
*/

'use strict';

var http = require('http');

module.exports = function(grunt) {

	var options;

	// Please see the Grunt documentation for more information regarding task
	// creation: http://gruntjs.com/creating-tasks
	function downloadLanguage (language, callback)
	{
		grunt.log.writeln ('Fetching ' + language.url);
		getJSON (getHttpParameters (language.token), function (data) {
			grunt.file.write (options.dest + '/' + language.token + '.json', JSON.stringify (data));
			callback ();
		});
	}

	function getHttpParameters (language)
	{
		var action = 'download';
		var project = options.src.project;

		var path = '/' + action + '/' + project;

		if (typeof (language) !== 'undefined') {
			path += '/' + language;

			path += '?format=' + options.format;
		}

		return {
			host: options.src.host,
			port: options.src.port,
			path: path
		};
	}

	function getJSON (parameters, callback) {
		http.get(parameters, function(resp){
			var rawData = '';
			resp.on('data', function(chunk){
				rawData += chunk;
			});

			resp.on('end', function() {
				var data = JSON.parse(rawData);
				callback (data);
			});

		}).on("error", function(e){
			console.log("Got error: " + e.message);
		});
	}

	grunt.registerMultiTask('i18n_downloader', 'A grunt task that downloads all available languages from an i18n-tracker', function() {

		// Merge task-specific and/or target-specific options with these defaults.
		options = this.options({
			'dest' : 'app/locales',
			'src' : {
				'host' : null,
				'project' : null,
				'port' : 80
			},
			'format' : 'json'
		});

		var done = this.async ();

		grunt.log.writeln ('Fetching language list');
		getJSON (getHttpParameters (), function (data) {
			var toProcess = data.length;
			var languages = [];

			var callback = function () {
				toProcess --;
				if (toProcess === 0) {
					done ();
				}
			};

			for (var i = 0; i < data.length; i++) {
				downloadLanguage (data[i], callback);

				if (data[i].token !== 'original') {
					languages.push ({
						'name' : data[i].name,
						'token' : data[i].token
					});
				}

				grunt.file.write (options.dest + '/languages.json', JSON.stringify (languages));
			}
		});
	});

};
