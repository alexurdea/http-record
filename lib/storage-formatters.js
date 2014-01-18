var Q = require('Q');

/**
 * @param {String} title
 * @param {fs.ReadStream} rs
 * @return {Q.Promise}
 */
function getDelimitedBlock(title, stream){
  var deferred = Q.defer(),
    startMark = startDelimiter(title),
    endMark = endDelimiter(title),
    blockStartIndex = -1,
    blockEndIndex = -1,
    content = '',
    resolved = false;

  stream.setEncoding('utf8');
  stream.on('data', function(chunck){
    var readTo,
      readFrom = 0;

    if (blockStartIndex < 0){
      blockStartIndex = chunck.indexOf(startMark);
      readFrom = blockStartIndex > -1 ? blockStartIndex + startMark.length : 0;
    } else {
      readFrom = 0;
    }    

    blockEndIndex = chunck.indexOf(endMark);
    readTo = blockEndIndex > -1 ? blockEndIndex : chunck.length;
    content += chunck.slice(readFrom, readTo);

    if (blockEndIndex >= 0){
      deferred.resolve(content);
      resolved = true;
    }    
  });
  stream.on('end', function(){
    if (!resolved){
      deferred.resolve(null);
    }
  });

  return deferred.promise;
}


/**
 * @param {String} title
 */
function startDelimiter(title){
  return '__' + title.toUpperCase() + '__\n\n';
};


/**
 * @param {String} title
 */
function endDelimiter(title){
  return '\n\n__/' + title.toUpperCase() + '__\n\n';
};


/**
 * @param {String} title
 * @param {String} data
 */
function delimitedBlock(title, content){
  return this.startDelimiter(title) + content + this.endDelimiter(title);
}

module.exports = {
  getDelimitedBlock: getDelimitedBlock,
  startDelimiter: startDelimiter,
  endDelimiter: endDelimiter,
  delimitedBlock: delimitedBlock
};