function handleConfigError(e){
  console.error('\n' + e.message + '\n');
  process.exit(1);
}


function ConfigFileError(msg){
  this.message = msg;
  this.name = 'ConfigFileError';
}


/**
 * @param {Object} argv
 */
function run(argv){
  // config
  var PROXY_PORT = 8000;
  var http = require('http');
  var ProxyStream = require('./lib/proxy-stream').ProxyStream;
  var url = require('url');
  var path = require('path');
  var fs = require('fs');
  var optRecord = argv.record;
  var optReplay = argv.replay;
  var optConfig = argv.config;
  var configPath, config;

  if (!optConfig){
    throw new ConfigFileError('Please provide a config file with --config=<path to file>');
    process.exit(1);
  }

  configPath = path.resolve(optConfig);

  try {
    config = require(configPath);
  } catch(e){
    throw new ConfigFileError('Cannot find config file ' + configPath);
  }

  var proxyPort = config.record.proxyPort || PROXY_PORT;


  var server = http.createServer(function(req, res){
    var proxyStream = new ProxyStream();

    proxyStream.on('error', function(){
      console.error('ERR: ', arguments);
    });

    options = url.parse(req.url);

    if(optReplay && !optRecord && config.replay.noProxy === true){
      // TODO: serve recording
      // If recording is missing, then display a warning to stderr
      console.warn('Serving recordings is not implemented');
    } else {
      var httpReq = http.request(options, function(serverRes){
        res.writeHead(serverRes.statusCode, serverRes.headers);

        // avoid pipe when there's no need to intercept
        if (proxyStream.intercept(serverRes)){
          proxyStream.initStorage('./data', req.method, req.url).then(function(){
            // write the headers to the file
            console.log(req.method, req.url);
            proxyStream.saveHeaders(serverRes.headers);

            // pipe the body to the file
            serverRes
            .pipe(proxyStream)
            .pipe(res);
          });
        } else {
          serverRes
          .pipe(res);
        }

      });
      req.pipe(httpReq);
    }
  }).listen(proxyPort);
}

var argv = require('optimist').argv;

if (require.main === module){
  try {
    run(argv);
  } catch(e){
    if (e.name === "ConfigFileError"){
      handleConfigError(e);
    }
  }
}

module.exports = {
  run: run,
  ConfigFileError: ConfigFileError
};