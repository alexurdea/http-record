var http = require('http');
var ProxyStream = require('../lib/proxy-stream');
var helperStreams = require('./helpers/streams');
var inStream, outStream,
  pipedValues,
  contentSaver;

describe('the content saver', function(){
  beforeEach(function(){
    pipedValues = ['a', 'b', 'c', 'd', 'e'];

    inStream = new helperStreams.ReadStream({
      data: pipedValues
    });
    outStream = new helperStreams.WriteStream();
    contentSaver = new ProxyStream();
  });
  
  it('should pipe data through', function(done){
    inStream.pipe(contentSaver).pipe(outStream);
    
    outStream
    .on('finish', function(){
      expect(outStream.data).toEqual(pipedValues);
      done();
    });
  });

  it('should be able to intercept JSON responses', function(){
    var response = new http.IncomingMessage();

    response.headers['content-type'] = 'application/json';
    expect(contentSaver.intercept(response)).toBe(true);

    response.headers['content-type'] = 'text/html';
    expect(contentSaver.intercept(response)).toBe(false);
  });
});