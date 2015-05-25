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

	// Please see the Grunt documentation for more information regarding task
	// creation: http://gruntjs.com/creating-tasks
	function downloadLanguage (language, callback)
	{
		grunt.log.writeln ('Fetching ' + language.url);
		getJSON (getHttpParameters (language.token), function (data) {
			grunt.file.write ('app/locales/' + language.token + '.json', JSON.stringify (data));
			callback ();
		});
	}

	function getHttpParameters (language)
	{
		var action = 'download';
		var project = 'quizwitz';

		var path = '/' + action + '/' + project;

		if (typeof (language) != 'undefined') {
			path += '/' + language;
		}

		return {
			host: 'catlab-translate.herokuapp.com',
			port: 80,
			path: path
		}
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

		var done = this.async ();

		grunt.log.writeln ('Fetching language list');
		getJSON (getHttpParameters (), function (data) {
			var toProcess = data.length;
			for (var i = 0; i < data.length; i++) {
				downloadLanguage (data[i], function () {
					toProcess --;
					if (toProcess === 0) {
						done ();
					}
				});
			}
		});
		//done ();
	});

};
