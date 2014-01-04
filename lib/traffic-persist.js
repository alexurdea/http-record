var url = require('url');
var fs = require('fs');
var baseDir;
var path = require('path');
var ERROR_NO_BASEDIR = 'Set base dir for module traffic-persist (use setBaseDir method)';
var Q = require('Q');


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
      fs.mkdir(baseDir + '/' + host, function(err){
        processPath(method, crtPath, reqPath, writeStreamDeferred).then(function(writeStream){
          deferred.resolve(writeStream);
        }, function(){
          console.error(e);
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
      var rs = fs.createWriteStream(crtPath + '/' + method + '_' + filePath[0]);
      deferred.resolve(rs);
    } catch (e){
      console.error(e);
      deferred.reject(e);
    }
    
  } else {
    crtPath += '/' + filePath.shift();
    fs.mkdir(crtPath, function(){
      processPath(method, crtPath, filePath, deferred);
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