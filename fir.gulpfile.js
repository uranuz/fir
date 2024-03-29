'use strict';

var
	devMode = process.env.NODE_ENV !== 'production',
	path = require('path'),
	gulp = require('gulp'),
	webpack = require('webpack'),
	nodeExternals = require('webpack-node-externals'),
	MiniCssExtractPlugin = require('mini-css-extract-plugin'),
	gutil = require("gulp-util"),
	vfs = require('vinyl-fs'),
	glob = require('glob'),
	yargs = require('yargs'),
	exec = require('child_process').exec,
	argv = yargs.argv,
	config = {};

(function resolveConfig() {
	config.outSite = argv.outSite;
	if( argv.publicPath ) {
		config.publicPath = argv.publicPath;
	} else {
		config.publicPath = '/pub/';
		console.warn('--publicPath is not set, so using default value: ' + config.publicPath);
	}
	
	if( argv.outPub ) {
		config.outPub = argv.outPub
	} else if( config.outSite ) {
		config.outPub = path.resolve(
			config.outSite,
			config.publicPath.replace(/^\//, '') // Trim leading slash
		);
		console.warn('--outPub is not set, so using default value: ' + config.outPub);
	}
	if( argv.outTemplates ) {
		config.outTemplates = argv.outTemplates
	} else if( config.outSite ) {
		config.outTemplates = path.resolve(config.outSite, 'res/templates');
		console.warn('--outTemplates is not set, so using default value: ' + config.outTemplates);
	}
})();

function buildLib(config, callback) {
	var
		libraryTarget = 'window',
		manifestsPath = path.join(config.outPub, `manifest/`);
	// run webpack
	webpack({
		context: __dirname,
		mode: (devMode? 'development': 'production'),
		entry: {
			fir: glob.sync(path.join(__dirname, 'fir/**/*.js')),
			fir_globals: [path.join(__dirname, 'fir/common/globals')]
		},
		resolve: {
			modules: [
				__dirname
			],
			extensions: ['.js'],
			symlinks: false
		},
		module: {
			rules: [
				{
					test: /\.s[ac]ss$/,
					use: [
						MiniCssExtractPlugin.loader,
						// Translates CSS into CommonJS
						{
							loader: 'css-loader',
							options: {
								sourceMap: true
							}
						},
						// Compiles Sass to CSS
						{
							loader: 'sass-loader',
							options: {
								sourceMap: true
							}
						}
					]
				},
				{
					test: /\.(png|jpe?g|gif|svg)$/,
					use: [
						{
							loader: 'file-loader',
							options: {
								name: '[path][name].[ext]',
								outputPath: config.outPub
							}
						}
					]
				}
			]
		},
		devtool: '(none)', //'cheap-source-map',
		output: {
			path: config.outPub,
			publicPath: config.publicPath,
			filename: '[name].js',
			libraryTarget: libraryTarget,
			library: '[name]',
		},
		plugins: [
			new webpack.DllReferencePlugin({
				//context: path.resolve(__dirname, '../ivy'),
				manifest: require(path.join(manifestsPath, 'ivy.manifest.json')),
				sourceType: libraryTarget
			}),
			new webpack.DllPlugin({
				name: '[name]',
				path: path.join(manifestsPath, '[name].manifest.json')
			}),
			new MiniCssExtractPlugin({
				// Options similar to the same options in webpackOptions.output
				// both options are optional
				filename: (devMode ? '[name].css' : '[name].[hash].css'),
				chunkFilename: (devMode ? '[id].css' : '[id].[hash].css'),
			})
		]
	}, function(err, stats) {
		if(err) {
			throw new gutil.PluginError("webpack", err);
		}
		gutil.log("[webpack]", stats.toString({
			// output options
		}));
		callback();
	});
}

gulp.task("compile-ivy-js-builder", function(cb) {
	cb();
});

gulp.task('fir-ivy-js-build-impl', function (cb) {
	exec(
		'/home/uranuz/projects/yar_mkk/ivy/bin/ivy_js_builder --sourcePath="' + config.outTemplates + '/fir" --outPath="' + config.outPub + '"',
		{
			cwd: path.resolve(config.outTemplates) // Set current working dir
		},
		function (err, stdout, stderr) {
			console.log(stdout);
			console.log(stderr);
			cb(err);
		}
	);
});

gulp.task("fir-webpack", function(callback) {
	if( !config.outPub ) {
		throw new Error('Need to pass "--outPub" or "--outSite" option to specify output directory!');
	}
	buildLib(config, callback);
});

gulp.task("fir-symlink-templates", function() {
	if( !config.outTemplates ) {
		throw new Error('Need to pass "--outTemplates" or "--outSite" option to specify output directory!');
	}
	return gulp.src(['fir/**/*.ivy'], {base: './'})
		.pipe(vfs.symlink(config.outTemplates));
});

gulp.task("fir-symlink-js", function() {
	if( !config.outPub ) {
		throw new Error('Need to pass "--outPub" or "--outPub" option to specify output directory!');
	}
	return gulp.src(['fir/**/*.js'], {
			base: './'
		})
		.pipe(vfs.symlink(config.outPub, {
			overwrite: false // Don't owerwrite files generated by webpack
		}));
});

gulp.task("fir-ivy-js-build", gulp.series(["compile-ivy-js-builder", "fir-ivy-js-build-impl"]));

// Create bundles then add nonexisting files as symlinks...
gulp.task("fir-js", gulp.series(["fir-ivy-js-build", "fir-webpack", "fir-symlink-js"]));

gulp.task("fir", gulp.series(["fir-symlink-templates", "fir-js"]));


gulp.task("default", gulp.series(['fir']));
