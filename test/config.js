'use strict';

const helper    = require( './helper' );
const should    = require( 'should' );
const stringify = JSON.stringify;

/* eslint no-underscore-dangle: 0 */
describe( 'Config', function () {
	describe( 'w/o provided dirname', function () {
		// Fetches default app config in parent's config directory
		const config = require( '../lib' )();

		it( 'should have config values', function () {
			config.should.have.property( 'service' );
			config.should.have.property( 'log' );
			config.log.should.have.property( 'console' );
			config.log.console.should.have.property( 'level' );
		} );
	} );

	describe( 'w/ provided dirname', function () {
		const config = require( '../lib' )( process.cwd() + '/test/data/config-1' );

		it( 'should have config values', function () {
			config.should.have.property( 'service' );
			config.should.have.property( 'log' );
			config.log.should.have.property( 'console' );
			config.log.console.should.have.property( 'level' );
		} );

		it( 'should have changeable values', function () {
			config.log.level = 'silly';
			config.version   = '0';

			config.log.level.should.eql( 'silly' );
			config.version.should.eql( '0' );
		} );
	} );

	describe( 'service property missing', function () {
		it( 'should throw an error', function () {
			const config = require( '../lib' );

			should( config.bind( config, process.cwd() + '/test/data/config-2' ) )
				.throw( 'Service name should be present in config' );
		} );
	} );

	describe( '.watch', function () {
		helper.setup( this );

		const config = require( '../lib' )( process.cwd() + '/test/data/config-1' );

		it( 'should work', function ( done ) {
			this.nock
				.put( '/v1/kv/test-service', stringify( config ) )
				.reply( 200 );

			this.nock
				.persist()
				.get( '/v1/kv/test-service?index=0&wait=30s' )
				.reply( 200, [ {
					'Key'   : 'test-service',
					'Value' : stringify( config )
				} ], { 'X-Consul-Index' : '5' } )
				.get( '/v1/kv/test-service?index=5&wait=30s' )
				.reply( 400 );

			config.watch( function ( error, response ) {
				should( error ).be.empty();

				response.should.have.property( 'key' );
				response.should.have.property( 'value' );

				response._watch.end();

				done();
			} );
		} );

		it( 'should work with config properties', function ( done ) {
			const key   = 'log.level';
			const value = config.log.level;

			this.nock
				.put( '/v1/kv/test-service/log.level', value )
				.reply( 200 );

			this.nock
				.persist()
				.get( '/v1/kv/test-service/log.level?index=0&wait=30s' )
				.reply( 200, [ {
					'Key'   : 'test-service/log.level',
					'Value' : value
				} ], { 'X-Consul-Index' : '5' } )
				.get( '/v1/kv/test-service/log.level?index=5&wait=30s' )
				.reply( 400 );

			config.watch( key, function ( error, response ) {
				should( error ).be.empty();

				response.should.have.property( 'key' );
				response.should.have.property( 'value' );

				response._watch.end();

				done();
			} );
		} );

		it( 'should work with non-string config properties', function ( done ) {
			const key   = 'consul.port';
			const value = config.consul.port;

			this.nock
				.put( '/v1/kv/test-service/consul.port', stringify( value ) )
				.reply( 200 );

			this.nock
				.persist()
				.get( '/v1/kv/test-service/consul.port?index=0&wait=30s' )
				.reply( 200, [ {
					'Key'   : 'test-service/consul.port',
					'Value' : value
				} ], { 'X-Consul-Index' : '5' } )
				.get( '/v1/kv/test-service/consul.port?index=5&wait=30s' )
				.reply( 400 );

			config.watch( key, function ( error, response ) {
				should( error ).be.empty();

				response.should.have.property( 'key' );
				response.should.have.property( 'value' );

				response._watch.end();

				done();
			} );
		} );

		it( 'should throw an error if watch fails', function ( done ) {
			const value = config.log.level;

			this.nock
				.put( '/v1/kv/test-service/log.level', value )
				.reply( 200 );

			this.nock
				.get( '/v1/kv/test-service/log.level' )
				.reply( 400 );

			config.watch( 'log.level', function ( error ) {
				should( error ).not.be.empty();

				done();
			} );
		} );
	} );
} );

