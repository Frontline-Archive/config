'use strict';

const consul    = require( 'consul' );
const path      = require( 'path' );
const dotty     = require( 'dotty' );
const bluebird  = require( 'bluebird' );
const defaults  = require( 'lodash/defaults' );
const stringify = JSON.stringify;

/* eslint no-underscore-dangle: 0 */
function Config ( dirname ) {
	if ( !( this instanceof Config ) ) {
		return new Config( dirname );
	}

	if ( typeof dirname !== 'string' || dirname === '' ) {
		dirname = path.resolve( process.cwd() + '/config' );
	}

	const config = require( dirname );

	if ( !config.service || typeof config.service !== 'string' ) {
		throw new Error( 'Service name should be present in config' );
	}

	// Proxies access to actual service config
	Object.keys( config ).forEach( key => {
		Object.defineProperty( this, key, {
			'configurable' : true,
			'enumerable'   : true,
			get () {
				return config[ key ];
			}
		} );

		Object.defineProperty( this, key, {
			'configurable' : true,
			'enumerable'   : true,
			set ( value ) {
				config[ key ] = value;
			}
		} );
	} );

	const opts = defaults( { 'promisify' : bluebird.fromCallback }, config.consul );

	// Initialize Consul connection
	Object.defineProperty( this, '_consul', {
		'configurable' : true,
		'enumerable'   : false,
		'value'        : consul( opts )
	} );

	Object.defineProperty( this, '_config', {
		'configurable' : true,
		'enumerable'   : false,
		'value'        : config
	} );
}

/**
 * Watches a config property.
 *
 * Sets the property first into Consul and adds a watch method
 * for the property. Returns the key/value to handler.
 *
 */
Config.prototype.watch = function ( property, handler ) {
	if ( typeof property === 'function' ) {
		handler  = property;
		property = null;
	}

	let value = stringify( this._config );
	let key   = this.service;

	// If property is provided, only watch that specific property
	if ( property ) {
		value = dotty.get( this, property );
		key   = `${this.service}/${property}`;
	}

	// we need to convert non-string values to string (including objects)
	// for Consul to save it properly
	if ( typeof value !== 'string' ) {
		value = stringify( value );
	}

	this._consul.kv.set( key, value ).then( () => {
		const watch = this._consul.watch( {
			'method'  : this._consul.kv.get,
			'options' : { key }
		} );

		watch.on( 'change', data => {
			const response = {};

			if ( data && data.Key ) {
				response.key   = data.Key.substr( this.service.length + 1 );
				response.value = data.Value;
			}

			// Set data returned by Consul as _data to be accessible in response
			Object.defineProperty( response, '_data', {
				'configurable' : true,
				'enumerable'   : false,
				'value'        : data
			} );

			// Set watch returned by Consul as _watch so we can
			// cancel watching from response in handlers.
			Object.defineProperty( response, '_watch', {
				'configurable' : true,
				'enumerable'   : false,
				'value'        : watch
			} );

			handler( null, response );
		} );

		watch.on( 'error', err => {
			handler( err );
		} );
	} );
};

module.exports = Config;
