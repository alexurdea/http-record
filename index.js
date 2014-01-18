var path = require('path');
var trafficPersist = require('./lib/traffic-persist');
var storageFormatters = require('./lib/storage-formatters');
var BASE_DIR = path.normalize(__dirname + '/data');

function handleConfigError(e){
  console.error('\n' + e.message + '\n');
  process.exit(1);
}


function ConfigError(msg){
  this.message = msg;
  this.name = 'ConfigError';
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
  var fs = require('fs');
  var optRecord = argv.record;
  var optReplay = argv.replay;
  var optConfig = argv.config;
  var configPath, config;

  if (!optConfig){
    throw new ConfigError('Please provide a config file with --config=<path to file>');
    process.exit(1);
  }

  configPath = path.resolve(optConfig);

  try {
    config = require(configPath);
  } catch(e){
    throw new ConfigError('Cannot find config file ' + configPath);
  }

  // it should be in either --record or --replay mode
  if (!optRecord && !optReplay){
    throw new ConfigError('Please use at least one of these modes: --record/--replay');
  }

  var proxyPort = config.record.proxyPort || PROXY_PORT;


  var server = http.createServer(function(req, res){
    var proxyStream = new ProxyStream(),
      recording, recordingPath;

    proxyStream.on('error', function(){
      console.error('ERR: ', arguments);
    });

    options = url.parse(req.url);

    if(optReplay && !optRecord && config.replay.noProxy === true){
      trafficPersist.setBaseDir(BASE_DIR);
      
      recordingPath = trafficPersist.urlToStoragePath(req.url, req.method);
      fs.exists(recordingPath, function(exists){
        if (!exists){
          console.error('Could not find recording for:', req.method.toUpperCase(), req.url);
        } else {
          storageFormatters.getDelimitedBlock('headers', fs.createReadStream(recordingPath))
          .then(function(headers){
            res.writeHead(200, JSON.parse(headers));
            return storageFormatters.getDelimitedBlock('content', fs.createReadStream(recordingPath));
          })
          .then(function(content){
            res.end(content);
          });
        }
      });
      
      return;

    } else {
      var httpReq = http.request(options, function(serverRes){
        res.writeHead(serverRes.statusCode, serverRes.headers);

        // avoid pipe when there's no need to intercept
        if (proxyStream.intercept(serverRes)){
          proxyStream.initStorage(BASE_DIR, req.method, req.url).then(function(){
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
    if (e.name === "ConfigError"){
      handleConfigError(e);
    }
  }
}

module.exports = {
  run: run,
  ConfigError: ConfigError
};