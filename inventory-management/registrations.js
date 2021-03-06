/**
 * This class defines all the routes to be registered on this application server.
 */

'use strict';
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const HapiSwagger = require('hapi-swagger');
const pkg = require('./package');

module.exports = function registrations(config) {
  const swaggerOptions = {
    swagger: '2.0',
    info: {
            version: pkg.version,
            title: 'Inventory Management API Documentation',
        },
    };
    return {
        // Each string in this array is `require`d during composition
        plugins: [
            './src/endpoints',
            Inert,
            Vision,
            {
                plugin: HapiSwagger,
                options: swaggerOptions
            }
        ],
    };
};