var trafficPersist;
var mocks = require('mocks');
var stream = require('stream');

describe('The traffic-persist module', function(){
  fs = mocks.fs.create({
    'rootdir': {}
  });
  trafficPersist = mocks.loadFile(__dirname + './../lib/traffic-persist', {
    fs: fs,
    expect: expect
  });
  

  it('should throw if there is no basedir set', function(){
    expect(function(){
      trafficPersist.createPath('GET', 'http://some.domain.com', function(){});
    }).toThrow(new Error(trafficPersist.ERROR_NO_BASEDIR));
  });


  describe('once the baseDir has been set', function(){
    beforeEach(function(){
      trafficPersist.setBaseDir('/rootdir');
    });

    
    it('should create a file hierarchy', function(done){
      trafficPersist.createPath('GET', 'http://some.domain.com/path/to/some/resource?foo=bar&baz=qux', 
        function complete(writeStream){
          fs.exists('/rootdir/some.domain.com/path/to/some/get_resource?foo=bar&baz=qux', function(exists){
            expect(exists).toBe(true);
            expect(writeStream instanceof fs.WriteStream).toBe(true);
            done();
        });
      });
    });

    
    it('should use an existing hierarchy', function(done){
      fs.mkdir('/rootdir/http://some.domain.com/path/', function(err){
        trafficPersist.createPath('POST', 'http://some.domain.com/path/to/some/resource',
          function complete(writeStream){
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