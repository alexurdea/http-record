#!/usr/bin/env node

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
  
  var webCliApp, io, serv;
  var configPath, config;
  
  var PROXY_PORT = 8000;
  var WEB_CLI_SERV_PORT = 8300;
  var WEBSOCKETS_PORT = controller.DEFAULT_SYNC_PORT;  // will only be used with NODE_ENV=development,
                                                       // otherwise websockets serv listens on WEB_CLI_SERV_PORT 

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
    // Set your NODE_ENV=development to work with the Grunt dev server,
    // or you will have to run with the production server
    // (which serves the compiled project from /web-client/dist)
    
    if (process.env.NODE_ENV === 'development'){
      io = require('socket.io').listen(WEBSOCKETS_PORT);

      console.log('\nWeb server started. NODE_ENV is "development".\n\n' +
        'Make sure that your Grunt dev server is started. The Grunt dev server usually runs on port 9000.\n' +
        'Point your browser to http://127.0.0.1:<Grunt dev server port>/?syncport=' + WEBSOCKETS_PORT + '\n');

    } else {
      webCliApp = require('./lib/server').start(__dirname + '/web-client/dist', WEB_CLI_SERV_PORT);
      serv = require('http').createServer(webCliApp);
      io = require('socket.io').listen(serv);

      console.log('\nWeb server started. Point your browser to http://127.0.0.1:' + WEB_CLI_SERV_PORT + '\n');
    }

    // start the Client Sync Manager
    require('./lib/client-sync-manager')(io);
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