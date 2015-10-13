module.exports = function(grunt) {
	grunt.initConfig({
		browserify: {
			dist: {
				files: {
					"dist/webmumble.js": ["./client/js/*.js", "./shared/*.js"],
				},
				options: {
					require: ["./client/js/bumble.js:Bumble"],
					exclude : ["binaryjs", "grunt", "grunt-browserify", "mumble", "ogg", "node-opus"],
					browserifyOptions: {
						debug: true
					}
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-browserify');

	grunt.registerTask("default", ["browserify"]);
};
