var stream = require('stream');
var Transform = stream.Transform;
var util = require('util');

var x = 0;

var ProxyStream = function(options){
  Transform.call(this, options);
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

module.exports = ProxyStream;