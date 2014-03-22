/*
Controller
==========

Events emitted:
- 'start', 'stop', 'restart' - for user actions
- 'record', 'replay' - for each url

It will attach an error attribute to the event objects, where an error
occurs. For example, when on start there is a EADDRINUSE error, it will
emit 'start', {<error obj>}.
*/

var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');
var EventEmitter = require('events').EventEmitter;

var RecordStream = require('./record-stream').RecordStream;
var trafficPersist = require('./traffic-persist');
var storageFormatters = require('./storage-formatters');

var BASE_DIR = path.normalize(__dirname + '/../data');
var controller = new EventEmitter();
var urlOpts;
var server;

controller.DEFAULT_SYNC_PORT = 8400;

/*
 * Parameters that came through from the command line:
 * @param {Boolean} options.record
 * @param {Boolean} options.replay
 * @param {Number} options.port
 */
controller.start = function startController(options){
  server = http.createServer(function(req, res){
    var recordStream = new RecordStream(),
      recording, recordingPath;

    recordStream.on('error', function(){
      console.error('ERR: ', arguments);
    });

    urlOpts = url.parse(req.url);

    if(options.replay && !options.record && config.replay.noProxy === true){
      // just replay, no proxy
      trafficPersist.setBaseDir(BASE_DIR);
      
      recordingPath = trafficPersist.urlToStoragePath(req.url, req.method);
      fs.exists(recordingPath, function(exists){
        if (!exists){
          console.error('Could not find recording for:', req.method.toUpperCase(), req.url);
        } else {
          this.emit('replay', {
            method: req.method,
            url: req.url
          });

          storageFormatters.getDelimitedBlock('headers', fs.createReadStream(recordingPath))
          .then(function(headers){
            res.writeHead(200, JSON.parse(headers));
            return storageFormatters.getDelimitedBlock('content', fs.createReadStream(recordingPath));
          })
          .then(function(content){
            res.end(content);
          });
        }
      });
      
      return;

    } else {
      var httpReq = http.request(urlOpts, function(serverRes){
        // record
        res.writeHead(serverRes.statusCode, serverRes.headers);

        if (recordStream.intercept(serverRes)){
          // intercept...
          recordStream.initStorage(BASE_DIR, req.method, req.url).then(function(){
            // write the headers to the file
            console.log(req.method, req.url);
            recordStream.saveHeaders(serverRes.headers);
            
            this.emit('record', {
              method: req.method,
              url: req.url
            });

            // pipe the body to the file
            serverRes
            .pipe(recordStream)
            .pipe(res);
          });
        } else {
          // ...or avoid pipe when there's no need to intercept
          serverRes
          .pipe(res);
        }

      });
      req.pipe(httpReq);
    }
  });

  server.on('error', function(e){
    controller.emit('start', {
      error: e
    });
  });
  server.listen(options.port || controller.DEFAULT_SYNC_PORT);

  this.emit('start');  
}

controller.stop = function stopController(){
  server.close(function(){
    controller.emit('stop');
  });
}

controller.restart = function restartController(options){
  this.stop();
  this.start(options);
  this.emit('restart');
}

module.exports = controller;