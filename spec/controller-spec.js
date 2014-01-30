var controller = require('../lib/controller');
var portscanner = require('portscanner');
var port = 5678;
var server;
var ctrlOpts = {
  record: true,
  port: port
};
var _ = require('lodash');
var restartServer = _.curry(startServer, true);

describe('controller', function(){
  
  describe('once started', function(){

    it('should bind to the port', function(done){
      controller.once('start', function(){
        portscanner.checkPortStatus(port, { timeout: 150 }, function(err, status){
          expect(err).toBe(null);
          expect(status).toBe('open');
          controller.stop(done);
        });
      });

      controller.start(ctrlOpts);
    });

  
    it('should stop binding to the port on stop', function(done){
      controller.once('start', function(){
        controller.stop(function(){
          portscanner.checkPortStatus(port, { timeout: 150 }, function(err, status){
            expect(status).toBe('closed');
            done();
          });
        });
      });

      controller.start(ctrlOpts);
    });
  

    it('should restart', function(done){
      startServer()
      .then(function(){
        return restartServer();
      })
      .then(function(){
        portscanner.checkPortStatus(port, { timeout: 150 }, function(err, status){
          expect(status).toBe('open');
          controller.stop(done);
        });
      });


    });


  });


});


/**
 * @param {Boolean} restart
 */
function startServer(restart){
  var Q = require('Q'),
    deferred = Q.defer();

  controller.once('start', function(){
    deferred.resolve();
  });
  controller[restart ? 'restart' : 'start'](ctrlOpts);

  return deferred.promise;
}