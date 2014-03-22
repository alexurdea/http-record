var express = require('express');
var WEB_PORT = 7654;
var STATIC_DIR = __dirname + '/../web-client/dist';
var server;

/*
 * @param {String} dir An absolute path.
 * @oaram {Number} port
 */
function start(dir, port){
  app = express();

  port || (port = WEB_PORT);

  server = app
  .use('/', express.static(dir || STATIC_DIR))
  .listen(port);

  return app;
}

function stop(){
  server.close();
}

module.exports = {
  start: start,
  stop: stop,
  WEB_PORT: WEB_PORT
};