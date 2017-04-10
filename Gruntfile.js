 module.exports = function (grunt) {
	'use strict';

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		symlink: {
			templates: {
				expand: true,
				src: 'controls/**/*.ivy',
				dest: 'templates/fir/',
				filter: 'isFile',
				overwrite: true
			},
			scripts: {
				expand: true,
				src: 'controls/**/*.js',
				dest: 'pub/fir/',
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
						dest: 'pub/fir/',
						ext: '.css',
						overwrite: true
					}
				]
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-symlink');
	grunt.loadNpmTasks('grunt-sass');
	grunt.registerTask('deploy', ['symlink:templates', 'symlink:scripts', 'sass:dist']);
}
