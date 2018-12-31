/*
 *
 * Premier fichier pour API
 *
 */

"use strict";

// Dependencies
const server = require('./lib/server');
const cli = require('./lib/cli');

// Declare the app
let app = {};

// Init function
app.init = () => {
  // Start the server
  server.init();

  // Start the CLI
 cli.init();
};

// Execute
app.init();


//Export the app
module.exports = app;
