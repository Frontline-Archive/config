'use strict';

/* eslint no-process-exit:0 */

// load third party modules
const del         = require( 'del' );
const gulp        = require( 'gulp' );
const mocha       = require( 'gulp-mocha' );
const istanbul    = require( 'gulp-istanbul' );
const enforcement = require( '@sinet/coverage-enforcement' );

const paths = {
	'cover' : [

		// Include everything to be covered
		'**/*.js',

		// Exclude files
		'!gulpfile.js',

		// Exclude directories that are not code
		'!instrumented/**',
		'!node_modules/**',
		'!test/**'
	],

	'test'     : [ 'test/**/*.js' ],
	'coverage' : 'instrumented'
};

gulp.task( 'clean-coverage', function () {
	del( [ paths.coverage ] );
} );

gulp.task( 'test', [ 'clean-coverage' ], function () {
	const covEnforcerOpts = { 'thresholds' : enforcement.thresholds };

	const mochaOptions = {
		'ui'       : 'bdd',
		'reporter' : 'spec',
		'bail'     : true,
		'timeout'  : 5000
	};

	return gulp.src( paths.cover )
		.pipe( istanbul( { 'includeUntested' : true } ) )
		.pipe( istanbul.hookRequire() )
		.on( 'finish', function () {
			gulp.src( paths.test, { 'read' : false } )
				.pipe(
					mocha( mochaOptions ).on( 'error', function ( mochaError ) {
						console.log( mochaError );
						process.exit( 1 );
					} )
				)
				.pipe(
					istanbul.writeReports( {
						'dir'       : paths.coverage,
						'reporters' : enforcement.reporters,

						'reportOpts' : {
							'dir'        : paths.coverage,
							'watermarks' : enforcement.watermarks
						}
					} )
				)
				.pipe(
					istanbul.enforceThresholds( covEnforcerOpts ).on( 'error', function () {
						console.log( 'error - coverage enforcer' );
						enforcement.log();
						process.exit( 1 );
					} )
				)
				.on( 'error', function () {
					process.exit( 1 );
				} )
				.on( 'end', function () {
					enforcement.log();
					process.exit();
				} );
		} );
} );
