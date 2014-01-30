var path = require('path');

var ERROR_OPTIONS_MODE = 'Please use at least one of these modes: '
  + '\n  --record/--replay for command line mode'
  + '\n  or'
  + '\n  --web-client for the web client interface';

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
  var controller = require('./lib/controller');
  
  var optRecord = argv.record;
  var optReplay = argv.replay;
  var optWebClient = argv['web-client'];
  var optConfig = argv.config;
  
  var configPath, config;
  
  var PROXY_PORT = 8000;

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
  if (!optRecord && !optReplay && !optWebClient){
    throw new ConfigError(ERROR_OPTIONS_MODE);
  }

  var proxyPort = config.record.proxyPort || PROXY_PORT;

  if (optRecord || optReplay){
    process.stdout.write('Starting proxy...');
    controller.start({
      record: optRecord,
      replay: optReplay,
      port: proxyPort
    });
    process.stdout.write(' started\n');
  } else if (optWebClient) {
    // start the communication server (websockets)
    // then start the webserver
  }
}

var argv = require('optimist').argv;

if (require.main === module){
  try {
    run(argv);
  } catch(e){
    if (e.name === "ConfigError"){
      handleConfigError(e);
    } else {
      throw e;
    }
  }
}

module.exports = {
  run: run,
  ConfigError: ConfigError,
  ERROR_OPTIONS_MODE: ERROR_OPTIONS_MODE
};