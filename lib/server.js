var express = require('express');
var WEB_PORT = 7654;
var STATIC_DIR = __dirname + '/../web-client/dist';
var server;

/*
 * dir {String} An absolute path.
 * port {Number}
 */
function start(dir, port){
  server = express();

  port || (port = WEB_PORT);

  server = server
  .use('/', express.static(dir || STATIC_DIR))
  .listen(port);

  return server;
}

function stop(){
  server.close();
}

module.exports = {
  start: start,
  stop: stop,
  WEB_PORT: WEB_PORT
};