var express = require('express');
var WEB_PORT = 7654;
var STATIC_DIR = __dirname + '/../web-client/dist';
var server;

var app = express();

/*
 * dir {String} An absolute path.
 * port {Number}
 */
function start(dir, port){
  server = app
  .use('/', express.static(dir || STATIC_DIR))
  .listen(port || WEB_PORT);
}

function stop(){
  server.close();
}

module.exports = {
  start: start,
  stop: stop,
  WEB_PORT: WEB_PORT
};