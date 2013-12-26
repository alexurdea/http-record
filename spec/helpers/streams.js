var stream = require('stream');
var Readable = stream.Readable;
var Writable = stream.Writable;
var util = require('util');


/**
 * Use an instance of this stream for testing.
 * It will yield its `data` array, one item at a time.
 * You can then compare results to the initialData attribute.
 *
 * @constructor
 * @param {Array} options.data
 */
var ReadStream = function(options){
  Readable.call(this, options);
  if (!Array.isArray(options.data)) {
    throw new Error('array expected in options.data');
  }
  options.data = options.data.map(function(c){
    return c.toString();
  });
  this.data = options.data;
  this.initialData = this.data.slice(0);  // clone
};

util.inherits(ReadStream, Readable);

ReadStream.prototype._read = function(n){
  if (this.data.length){
    this.push(this.data.shift());
  } else {
    this.push(null);
  }
};


/**
 * Use an instance of this stream for testing.
 * It will yield its `data` array, one item at a time.
 * You can then compare results to the initialData attribute.
 *
 * @constructor
 * @param {Array} options.data
 */
var WriteStream = function(options){
  Writable.call(this, options);
  this.data = [];
};

util.inherits(WriteStream, Writable);

WriteStream.prototype._write = function(chunck, encoding, callback){
  this.data.push(chunck.toString());
  callback();
};

module.exports = {
  ReadStream: ReadStream,
  WriteStream:WriteStream
};