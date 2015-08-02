module.exports = function(grunt) {
	grunt.initConfig({
		browserify: {
			dist:{
				files: {
					"dist/webmumble.js": ["./client/js/*.js", "./shared/*.js"]
				},
				options: {
					"require": ["./client/js/client.js:Client"]
				}
			}
		}
	});
	
	grunt.loadNpmTasks('grunt-browserify');
	
	grunt.registerTask("default", ["browserify"]);
};