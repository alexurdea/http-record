var url = require('url');
var fs = require('fs');
var baseDir;
var path = require('path');
var ERROR_NO_BASEDIR = 'Set base dir for module traffic-persist (use setBaseDir method)';


/**
 * Creates the path according to the 
 * 
 * @param {String} method One of GET/POST/etc
 * @param {String} reqUrl
 * @param {Function} callback
 */
function createPath(method, reqUrl, callback){//http://some.domain.com/path/to/resource?foo=bar
  var host, reqPath, crtPath;

  if (!baseDir) throw new Error(ERROR_NO_BASEDIR);

  reqUrl = url.parse(reqUrl);
  host = (reqUrl.port == 80 || reqUrl.port == null) ? reqUrl.hostname : reqUrl.host;

  reqPath = path.normalize(reqUrl.path);
  crtPath = baseDir + '/' + host;
  reqPath = reqUrl.path.split('/').slice(1);
  fs.exists(crtPath, function(exists){
    if (exists){
      processPath(method, crtPath, reqPath, callback);
    } else {
      fs.mkdir(baseDir + '/' + host, function(err){
        processPath(method, crtPath, reqPath, callback);
      });
    }
  });
}


/**
 * @param {String} crtPath
 * @param {String} method One of GET/POST/etc
 * @param {Array} filePath
 * @param {Function} callback
 */
function processPath(method, crtPath, filePath, callback){
  method = method.toLowerCase();
  if (filePath.length == 1){
    try {
      callback(fs.createWriteStream(crtPath + '/' + method + '_' + filePath[0]));
    } catch (e){
      console.error(e);
    }
    
  } else {
    crtPath += '/' + filePath.shift();
    fs.mkdir(crtPath, function(){
      processPath(method, crtPath, filePath, callback);
    });
  }
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