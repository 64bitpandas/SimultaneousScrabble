/**
 * ENTRY POINT for server.js.
 * Uses babel to compile es6 into
 */
require('@babel/register')({
  presets: ['env'],
});

module.exports = require('./index.js');
