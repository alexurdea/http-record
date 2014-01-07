var mocks = require('mocks');
var proxyquire = require('proxyquire');
var http = require('http');
var helperStreams = require('./helpers/streams');

var inStream, outStream,
  pipedValues,
  prox,
  trafficPersistMock;

trafficPersistMock = {
  createPath: function(){
    var Q = require(Q);
    var deferred = Q.defer();
    var stream = require('stream');

    // mock the fs.WriteStream instance with a stream.Writable instance
    deferred.resolve(new stream.Writable());

    return deferred.promise;
  },
  setBaseDir: function(){ baseDir = ''; }
};

var proxyStream = proxyquire('../lib/proxy-stream', {
  trafficPersist: trafficPersistMock,
  expect: expect
});

var ProxyStream = proxyStream.ProxyStream;
var ERROR_WRITE_STREAM_NOT_INIT = proxyStream.ERROR_WRITE_STREAM_NOT_INIT;


describe('the proxy stream', function(){
  beforeEach(function(){
    pipedValues = ['a', 'b', 'c', 'd', 'e'];

    inStream = new helperStreams.ReadStream({
      data: pipedValues
    });
    outStream = new helperStreams.WriteStream();
    prox = new ProxyStream();
  });


  it('should be able to intercept JSON responses', function(){
    var response = new http.IncomingMessage();

    response.headers['content-type'] = 'application/json';
    expect(prox.intercept(response)).toBe(true);

    response.headers['content-type'] = 'text/html';
    expect(prox.intercept(response)).toBe(false);
  });


  it('should throw if the storage has not been init', function(done){
    prox.on('error', function(err){
      expect(err.message).toEqual(ERROR_WRITE_STREAM_NOT_INIT);
      done();
    });
    inStream.pipe(prox).pipe(outStream);
  });

  
  describe('once the storage has been initialized', function(){
    var storageInitP;

    beforeEach(function(){
      storageInitP = prox.initStorage('someDir', 'GET', 'http://some.domain.com/');
      prox.on('error', function(e){
        throw e;
      });
    });

    afterEach(function(){
      storageInitP = null;
    });


    it('should pipe data through', function(){
      storageInitP.then(function(){
        prox
        .on('finish', function(){
          expect(outStream.data).toEqual(pipedValues);
          done();
        });

        inStream.pipe(prox).pipe(outStream);
      });
    });
  });


});