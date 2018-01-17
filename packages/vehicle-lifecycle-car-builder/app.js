var express = require('express'),
  path = require('path'),
  WebSocket = require('ws'),
  http = require('http'),
  url = require('url'),
  config = require('config');


// create a new express server
var app = express();
var server = http.createServer(app);

app.get('/assets/config.json', (req, res, next) => {
  res.json({
    restServer: process.env.REST_SERVER_CONFIG || config.get("restServer")
  });
});

// static - all our js, css, images, etc go into the assets path
app.use(express.static(path.join(__dirname, 'www')));

// start server on the specified port
server.listen(8100, function () {
  'use strict';
  // print a message when the server starts listening
  console.log('server starting on http://localhost:8100');
});
