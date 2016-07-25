'use strict';

/**
 *
 * Sample config for testing
 *
 */

let config = {
	'consul' : {
		'host' : 'consul',
		'port' : 8500
	},

	'service' : 'test-service',

	'version' : '1.0.0',

	'log' : {
		'console' : {
			'level' : 'info'
		}
	}
};

module.exports = config;
