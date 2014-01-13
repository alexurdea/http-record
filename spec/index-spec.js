var optimist = require('optimist');
var mocks = require('mocks');
var mockFs = mocks.fs.create({
  'somedir': {
    'conf': {
      'example.conf.js': mocks.fs.file('1')
    }
  }
});
var mockPath = {};

var httpRecord = mocks.loadFile(__dirname + './../index', {
    fs: mockFs,
    path: mockPath
  });

describe('httpRecord', function(){
  describe('run', function(){
    var argv, errMessages;

    console.error = function(msg){
      errMessages.push(msg);
    };

    beforeEach(function(){
      errMessages = [];
    });


    it('errors if the --config argument was not provided', function(){
      var argv = optimist.parse([]);

      expect(function(){
        httpRecord.run(argv);
      }).toThrow('Please provide a config file with --config=<path to file>');
    });


    it('errors if the pointed config file does not exist', function(){
      var argv = optimist.parse(['--config', 'conf']),
        inexistentPath = '/somedir/conf/no-file-here';

      mockPath.resolve = function(){
        return inexistentPath;
      };
      
      expect(function(){
        httpRecord.run(argv);
      }).toThrow('Cannot find config file ' + inexistentPath);
    });

    
    it('errors if the pointed config file is not a file', function(){
      var argv = optimist.parse(['--config', 'conf']),
        directoryNotFile = 'somedir/conf';

      mockPath.resolve = function(){
        return directoryNotFile;
      };
      
      expect(function(){
        httpRecord.run(argv);
      }).toThrow('Cannot find config file ' + directoryNotFile);
    });


  });
});