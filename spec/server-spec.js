var server = require('../lib/server');
var http = require('http');
var url = require('url');
var fs = require('fs');
var helperStreams = require('./helpers/streams');

describe('static server', function(){
  var port = 7654;
  var dir = __dirname + '/fixtures/server';
  var ws = new helperStreams.WriteStream();
  var file = dir + '/file.html';
  var fileContent = fs.readFileSync(file, 'utf8');

  beforeEach(function(){
    server.start(dir, port);
  });

  afterEach(function(){
    server.stop();
  });

  it('should serve what\'s is in the set directory', function(done){    
    http.get(url.parse('http://localhost:' + port + '/file.html'), function(serverRes){
      serverRes.pipe(ws);
      serverRes.on('end', function(){
        expect(ws.data.join('')).toEqual(fileContent);
        done();
      });
    });

    
  });
});