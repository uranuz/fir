 module.exports = function (grunt) {
	'use strict';

	// Force use of Unix newlines
	grunt.util.linefeed = '\n';
	var expandTilde = require('expand-tilde');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		deployPath: expandTilde(grunt.option('deployPath') || '~/sites/mkk'),
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
					'controls/**/*.js',
					'security/**/*.js',
					'ivy/**/*.js'
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
			templates: {
				options: { force: true },
				files: { src: '<%= deployPath %>/res/templates/fir/**/*.ivy' }
			},
			scripts: {
				options: { force: true },
				files: { src: '<%= deployPath %>/pub/fir/**/*.js' }
			},
			styles: {
				options: { force: true },
				files: { src: '<%= deployPath %>/pub/fir/**/*.css' }
			}
		},
		watch: {
			sass: {
				files: ['controls/**/*.scss'],
				tasks: ['sass:dist'],
				options: {
					spawn: false,
				},
			},
		}
	});

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-symlink');
	grunt.loadNpmTasks('grunt-sass');
	grunt.loadNpmTasks('grunt-contrib-clean');

	grunt.registerTask('cleanAll', ['clean:templates', 'clean:scripts', 'clean:styles'])
	grunt.registerTask('deploy', ['cleanAll', 'symlink:templates', 'symlink:scripts', 'sass:dist']);
	grunt.registerTask('default', ['deploy']);
}
