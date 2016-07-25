'use strict';

require( 'should' );

const nock  = require( 'nock' );
const sinon = require( 'sinon' );

/* eslint no-underscore-dangle: 0 */
function setup ( scope ) {
	if ( scope._setup ) {
		return;
	}

	scope._setup = true;

	beforeEach.call( scope, function () {
		const self = this;

		self.sinon = sinon.sandbox.create();

		nock.disableNetConnect();

		Object.defineProperty( self, 'nock', {
			'configurable' : true,
			'enumerable'   : true,
			get () {
				return nock( 'http://127.0.0.1:8500' )
					.filteringPath( /%2F/g, '/' );
			}
		} );
	} );

	afterEach.call( scope, function () {
		this.sinon.restore();

		nock.cleanAll();
	} );
}

exports.setup = setup;
