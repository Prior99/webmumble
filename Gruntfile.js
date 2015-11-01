module.exports = function(grunt) {
	grunt.initConfig({
		browserify: {
			dist: {
				files: {
					"dist/bundle.js": ["./client/js/*.js", "./shared/*.js"],
				},
				options: {
					exclude : ["binaryjs", "grunt", "grunt-browserify", "mumble", "ogg", "node-opus"],
					browserifyOptions: {
						debug: true
					},
					transform: [["babelify"]]
				}
			}
		},
		watch: {
			scripts: {
				files: ['**/*.js', '**/*.less'],
				tasks: ['default'],
				options: {
					spawn: false,
				},
			},
		},
		less: {
			development: {
				files: {
					"dist/bundle.css": "client/style/style.less"
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-less');

	grunt.registerTask("default", ["browserify", "less"]);
};
