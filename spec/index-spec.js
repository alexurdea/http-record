var spawn = require('child_process').spawn;
var path = require('path');
var INDEX_PATH = path.resolve(__dirname + '/../index.js');
var index = require(INDEX_PATH);
var ERROR_OPTIONS_MODE = index.ERROR_OPTIONS_MODE;


var endStream = require('./helpers/process').endStream;
var exitProcess = require('./helpers/process').exitProcess;
var listenToProcess = require('./helpers/process').listenToProcess;

describe('httpRecord', function(){

  describe('run', function(){
    var errorMsg = '';
    
    beforeEach(function(){
      errorMsg = '';
    });
    
    it('errors when at least one of --record or --replay have been provided',
    function(done){
      var proc = spawn('node', [INDEX_PATH, '--config=./conf/example.conf.js']);

      listenToProcess(proc, function(chunck){
        errorMsg += chunck;
      }).then(function(exitCode){
        expect(exitCode).toBeGreaterThan(0);
        expect(errorMsg.trim()).toEqual(ERROR_OPTIONS_MODE);
        done();
      });
    });


    it('errors if the --config argument was not provided', function(done){
      var proc = spawn('node', [INDEX_PATH, '--record']);
      
      listenToProcess(proc, function(chunck){
        errorMsg += chunck;
      }).then(function(exitCode){
        expect(exitCode).toBeGreaterThan(0);
        expect(errorMsg.trim()).toEqual('Please provide a config file with --config=<path to file>');
        done();
      });
    });

    
    it('errors if the pointed config file is not a file', function(done){
      var configPath = './conf',
        proc = spawn('node', [INDEX_PATH, '--record', '--config=' + configPath]);

      listenToProcess(proc, function(chunck){
        errorMsg += chunck;
      }).then(function(exitCode){
        expect(exitCode).toBeGreaterThan(0);
        expect(errorMsg.trim()).toEqual('Cannot find config file ' + path.resolve(configPath));
        done();
      });
    });


  });


});