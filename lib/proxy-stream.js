var stream = require('stream');
var Transform = stream.Transform;
var util = require('util');
var trafficPersist = require('./traffic-persist');
var storageFormatters = require('./storage-formatters');
var ERROR_WRITE_STREAM_NOT_INIT = 'Write stream not initialized! ' +
  'Use the initStorage() method.';


/**
 * @constructor
 * @param {Object} options
 */
var ProxyStream = function(options){
  Transform.call(this, options);
  this.writeStream = null;
  this.once('pipe', function(){
    if (!this.writeStream) {
      throw new Error(ERROR_WRITE_STREAM_NOT_INIT);
    }
    this.writeStream.write(storageFormatters.startDelimiter('content'));
    this.once('end', function(){
      this.writeStream.write(storageFormatters.endDelimiter('content'));
    });
  });
};
util.inherits(ProxyStream, Transform);


/**
* @param {Object} headers
*/
ProxyStream.prototype.saveHeaders = function writeHeaders(headers){
  if (!this.writeStream) {
    throw new Error(ERROR_WRITE_STREAM_NOT_INIT);
  }
  headers = JSON.stringify(headers)
    .replace(/",/g, '",\n')
    .replace(/^\{/, '{\n')
    .replace(/\}$/, '\n}');

  this.writeStream.write(storageFormatters.delimitedBlock('headers', headers));
};


/**
 * @param {Buffer|String} chunck
 * @param {String} encoding
 * @param {Function} callback
 */
ProxyStream.prototype._transform = function saveAndPassThrough(chunck, encoding, callback){
  this.push(chunck);
  if (!this.writeStream) {
    callback(new Error(ERROR_WRITE_STREAM_NOT_INIT));
    return;
  }
  this.writeStream.write(chunck);
  callback();
};


/**
 * It will just filter the responses with
 * content-type: application/json, *for now*.
 * 
 * @param {http.IncomingMessage} res
 */
ProxyStream.prototype.intercept = function(res){
  var contentType = res.headers['content-type'];
  if (contentType && /^application\/json/.test(contentType)){
    return true;
  }

  return false;
};


/**
 * @param {String} baseDir
 * @param {String} method
 * @param {String} url
 * @returns {Q.Promise}
 */
ProxyStream.prototype.initStorage = function(baseDir, method, url){
  trafficPersist.setBaseDir(baseDir);
  var self = this;

  return trafficPersist.createPath(method, url).then(function(writeStream){
    self.writeStream = writeStream;
  });
}


module.exports = {
  ProxyStream: ProxyStream,
  ERROR_WRITE_STREAM_NOT_INIT: ERROR_WRITE_STREAM_NOT_INIT
};