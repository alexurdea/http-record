var mocks = require('mocks');
var proxyquire = require('proxyquire');
var http = require('http');
var helperStreams = require('./helpers/streams');

var inStream, outStream,
  pipedValues,
  recStream,
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

var recordStream = proxyquire('../lib/record-stream', {
  trafficPersist: trafficPersistMock,
  expect: expect
});

var RecordStream = recordStream.RecordStream;
var ERROR_WRITE_STREAM_NOT_INIT = recordStream.ERROR_WRITE_STREAM_NOT_INIT;


describe('the record stream', function(){
  beforeEach(function(){
    pipedValues = ['a', 'b', 'c', 'd', 'e'];

    inStream = new helperStreams.ReadStream({
      data: pipedValues
    });
    outStream = new helperStreams.WriteStream();
    recStream = new RecordStream();
  });


  it('should be able to intercept JSON responses', function(){
    var response = new http.IncomingMessage();

    response.headers['content-type'] = 'application/json';
    expect(recStream.intercept(response)).toBe(true);

    response.headers['content-type'] = 'text/html';
    expect(recStream.intercept(response)).toBe(false);
  });


  it('should throw on pipe if the storage has not been init', function(){
    expect(function(){
      inStream.pipe(recStream).pipe(outStream);
    }).toThrow(ERROR_WRITE_STREAM_NOT_INIT);
  });


  it('should throw on writeHeaders if storage not init', function(){
    expect(function(){
      recStream.saveHeaders({'content-type': 'text/html'});
    }).toThrow(ERROR_WRITE_STREAM_NOT_INIT);
  });

  
  describe('once the storage has been initialized', function(){
    var storageInitP;

    beforeEach(function(){
      storageInitP = recStream.initStorage('someDir', 'GET', 'http://some.domain.com/');
      recStream.on('error', function(e){
        throw e;
      });
    });

    afterEach(function(){
      storageInitP = null;
    });

    it('should pipe data through', function(){
      storageInitP.then(function(){
        recStream
        .on('finish', function(){
          expect(outStream.data).toEqual(pipedValues);
          done();
        });

        inStream.pipe(recStream).pipe(outStream);
      });
    });
  });

});