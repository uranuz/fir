 module.exports = function (grunt) {
	'use strict';

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		deployPath: grunt.option('deployPath') || '.',
		symlink: {
			templates: {
				expand: true,
				src: 'controls/**/*.ivy',
				dest: '<%= deployPath %>/res/templates/fir/',
				filter: 'isFile',
				overwrite: true
			},
			scripts: {
				expand: true,
				src: [
					'common/**/*.js',
					'datctrl/**/*.js',
					'network/**/*.js',
					'controls/**/*.js'
				],
				dest: '<%= deployPath %>/pub/fir/',
				filter: 'isFile',
				overwrite: true
			}
		},
		sass: {
			dist: {
				files: [
					{
						expand: true,
						src: ['controls/**/*.scss'],
						dest: '<%= deployPath %>/pub/fir/',
						ext: '.css',
						overwrite: true
					}
				]
			}
		},
		clean: {
			templates: ['<%= deployPath %>/res/templates/fir/**/*.ivy'],
			scripts: ['<%= deployPath %>/pub/fir/**/*.js'],
			styles: ['<%= deployPath %>/pub/fir/**/*.css']
		}
	});

	grunt.loadNpmTasks('grunt-contrib-symlink');
	grunt.loadNpmTasks('grunt-sass');
	grunt.loadNpmTasks('grunt-contrib-clean');

	grunt.registerTask('cleanAll', ['clean:templates', 'clean:scripts', 'clean:styles'])
	grunt.registerTask('deploy', ['cleanAll', 'symlink:templates', 'symlink:scripts', 'sass:dist']);
	grunt.registerTask('default', ['deploy']);
}
