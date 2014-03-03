var q = require('q');

/**
 * @param {stream.Readable}
 * @returns {Q.Promise}
 */
function endStream(stream){
  var deferred = q.defer();

  stream.on('end', function(){
    deferred.resolve();
  });
  return deferred.promise;
}


/**
 * @param {child_process.ChildProcess} proc
 * @returns {Q.Promise}
 */
function exitProcess(proc){
  var deferred = q.defer();

  proc.on('exit', function(exitCode){
    deferred.resolve(exitCode);
  });
  return deferred.promise;
}


/**
 * @param {child_process.ChildProcess} proc
 * @param {Function} errDataCb If provided, it will receive chuncks of data from
 *        proc.stderr
 * @returns {Q.Promise}
 */
function listenToProcess(proc, errDataCb){
  proc.stderr.setEncoding('utf8');

  var endStreamP = endStream(proc.stderr);
  var exitProcessP = exitProcess(proc);

  if (errDataCb){
    proc.stderr.on('data', errDataCb);
  }

  return q.all(exitProcessP, endStreamP);
}


module.exports = {
  endStream: endStream,
  exitProcess: exitProcess,
  listenToProcess: listenToProcess
};