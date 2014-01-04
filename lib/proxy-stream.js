var stream = require('stream');
var Transform = stream.Transform;
var util = require('util');
var trafficPersist = require('./traffic-persist');


var ProxyStream = function(options){
  Transform.call(this, options);
  this.writeStream = null;
};
util.inherits(ProxyStream, Transform);


/**
 * @param {Buffer|String} chunck
 * @param {String} encoding
 * @param {Function} callback
 */
ProxyStream.prototype._transform = function saveAndPassThrough(chunck, encoding, callback){
  this.push(chunck);
  callback();
};


/*
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


ProxyStream.prototype.initStorage = function(baseDir, method, url){
  trafficPersist.setBaseDir(baseDir);
  trafficPersist.createPath(method, url, function(writeStream){
    this.writeStream = writeStream;
  });
}


module.exports = {
  ProxyStream: ProxyStream
};