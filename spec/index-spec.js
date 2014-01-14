var spawn = require('child_process').spawn;
var q = require('q');
var path = require('path');
var INDEX_PATH = path.resolve(__dirname + '/../index.js');


function endStream(stream){
  var deferred = q.defer();

  stream.on('end', function(){
    deferred.resolve();
  });
  return deferred.promise;
}

function exitProcess(process){
  var deferred = q.defer();

  process.on('exit', function(exitCode){
    deferred.resolve(exitCode);
  });
  return deferred.promise;
};


describe('httpRecord', function(){
  

  describe('run', function(){
    var errorMsg = '';
    
    beforeEach(function(){
      errorMsg = '';
    });

    function listenToProcess(proc){
      proc.stderr.setEncoding('utf8');

      var endStreamP = endStream(proc.stderr);
      var exitProcessP = exitProcess(proc);

      proc.stderr.on('data', function(chunck){
        errorMsg += chunck;
      });

      return q.all(exitProcessP, endStreamP);
    }

    
    it('errors when at least one of --record or --replay have been provided',
    function(done){
      var proc = spawn('node', [INDEX_PATH, '--config=./conf/example.conf.js']);

      listenToProcess(proc).then(function(exitCode){
        expect(exitCode).toBeGreaterThan(0);
        expect(errorMsg.trim()).toEqual('Please use at least one of these modes: --record/--replay');
        done();
      })
    });


    it('errors if the --config argument was not provided', function(done){
      var proc = spawn('node', [INDEX_PATH, '--record']);
      
      listenToProcess(proc).then(function(exitCode){
        expect(exitCode).toBeGreaterThan(0);
        expect(errorMsg.trim()).toEqual('Please provide a config file with --config=<path to file>');
        done();
      });
    });

    
    it('errors if the pointed config file is not a file', function(done){
      var configPath = './conf',
        proc = spawn('node', [INDEX_PATH, '--record', '--config=' + configPath]);

      listenToProcess(proc).then(function(exitCode){
        expect(exitCode).toBeGreaterThan(0);
        expect(errorMsg.trim()).toEqual('Cannot find config file ' + path.resolve(configPath));
        done();
      });
    });


  });


});