var trafficPersist;
var mocks = require('mocks');
var stream = require('stream');
var Q = require('Q');

describe('The traffic-persist module', function(){
  fs = mocks.fs.create({
    'rootdir': {}
  });
  // console.log('MFS', fs, '\n.....\n');
  trafficPersist = mocks.loadFile(__dirname + './../lib/traffic-persist', {
    fs: fs,
    expect: expect
  });
  

  it('should throw if there is no basedir set', function(){
    expect(function(){
      trafficPersist.createPath('GET', 'http://some.domain.com', function(){});
    }).toThrow(new Error(trafficPersist.ERROR_NO_BASEDIR));
  });


  describe('urlToStoragePath', function(){
    it('should throw if the baseDir is not set', function(){
      var someUrl = 'http://some.domain.com/foo';

      expect(function(){
        trafficPersist.urlToStoragePath(someUrl, 'GET');
      }).toThrow(trafficPersist.ERROR_NO_BASEDIR);
    });

    it('should return a correct path', function(){
      trafficPersist.setBaseDir('/somedir');
      expect(trafficPersist.urlToStoragePath('https://www.somedomain.com/foo/bar?baz=123', 'GET'))
      .toEqual('/somedir/www.somedomain.com/foo/get_bar?baz=123');
      
      expect(trafficPersist.urlToStoragePath('http://somedomain.com/foo', 'get'))
      .toEqual('/somedir/somedomain.com/get_foo');
      expect(trafficPersist.urlToStoragePath('http://somedomain.com/foo/bar', 'POST'))
      .toEqual('/somedir/somedomain.com/foo/post_bar');
    });


  });


  describe('once the baseDir has been set', function(){
    beforeEach(function(){
      trafficPersist.setBaseDir('/rootdir');
    });


    describe('createPath', function(){
      it('should return a promise', function(){
        var p = trafficPersist.createPath('GET', 'http://some.domain.com/path/to/some/resource?foo=bar&baz=qux');
        expect(Q.isPromise(p)).toBe(true);
      });


      it('should create a file hierarchy', function(done){
        // console.log('RFS?', fs, '\n....\n');
        trafficPersist.setBaseDir('/rootdir');
        trafficPersist.createPath('GET', 'http://some.domain.com/path/to/some/resource?foo=bar&baz=qux')
        .then(function complete(writeStream){
          // console.log('XX', writeStream);
          fs.exists('/rootdir/some.domain.com/path/to/some/get_resource?foo=bar&baz=qux', function(exists){
            expect(exists).toBe(true);
            expect(writeStream instanceof fs.WriteStream).toBe(true);
            done();
          });
        });
      });

      
      it('should use an existing hierarchy', function(done){
        fs.mkdir('/rootdir/http://some.domain.com/path/', function(err){
          trafficPersist.createPath('POST', 'http://some.domain.com/path/to/some/resource')
          .then(function complete(writeStream){
            fs.exists('/rootdir/some.domain.com/path/to/some/post_resource', function(exists){
              expect(exists).toBe(true);
              expect(writeStream instanceof fs.WriteStream).toBe(true);
              done();
            });
          });
        });
      });


    });


  });


});