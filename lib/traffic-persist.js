var url = require('url');
var fs = require('fs');
var path = require('path');
var ERROR_NO_BASEDIR = 'Set base dir for module traffic-persist (use setBaseDir method)';
var Q = require('Q');
var baseDir = null;

/**
 * Creates the path according to the 
 * 
 * @param {String} method One of GET/POST/etc
 * @param {String} reqUrl
 * @returns {Q.Promise}
 */
function createPath(method, reqUrl){//http://some.domain.com/path/to/resource?foo=bar
  var host, reqPath, crtPath,
    deferred = Q.defer();

  if (!baseDir) throw new Error(ERROR_NO_BASEDIR);

  reqUrl = url.parse(reqUrl);
  host = (reqUrl.port == 80 || reqUrl.port == null) ? reqUrl.hostname : reqUrl.host;

  reqPath = path.normalize(reqUrl.path);
  crtPath = baseDir + '/' + host;
  reqPath = reqUrl.path.split('/').slice(1);
  fs.exists(crtPath, function(exists){
    var writeStreamDeferred = Q.defer();
    if (exists){
      processPath(method, crtPath, reqPath, writeStreamDeferred).then(function(writeStream){
        deferred.resolve(writeStream);
      }, function(e){
        console.error(e);
      });
    } else {
      // console.log('WTFFFFFFF', this);
      fs.mkdir(baseDir + '/' + host, function(err){
        // console.log(baseDir + '/' + host, err, 'zzzz');
        processPath(method, crtPath, reqPath, writeStreamDeferred).then(function(writeStream){
          deferred.resolve(writeStream);
        }, function(){
          console.error(e, 'HUH!');
        })
      });
    }
  });

  return deferred.promise;
}


/**
 * @param {String} crtPath
 * @param {String} method One of GET/POST/etc
 * @param {Array} filePath
 * @returns {Q.Promise}
 */
function processPath(method, crtPath, filePath, deferred){
  method = method.toLowerCase();
  if (filePath.length == 1){
    try {
      try {
        // console.log(fs.readdirSync(crtPath), 'EXISTS!');
      } catch (e) { console.log('WTF', e) };
      var rs = fs.createWriteStream(crtPath + '/' + method + '_' + filePath[0]);
      deferred.resolve(rs);
    } catch (e){
      console.error(e);
      deferred.reject(e);
    }
    
  } else {
    crtPath += '/' + filePath.shift();
    fs.mkdir(crtPath, function(err){
      // console.log('YEAHHH?', err)
      processPath(method, crtPath, filePath, deferred);
      // console.log(fs.readdirSync(crtPath), 'EXISTS!');
    });
  }
  return deferred.promise;
}


/**
 * @param {String} base
 */
function setBaseDir(base){
  baseDir = base;
}


module.exports = {
  createPath: createPath,
  setBaseDir: setBaseDir,
  ERROR_NO_BASEDIR: ERROR_NO_BASEDIR
};