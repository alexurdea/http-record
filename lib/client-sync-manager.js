var _ = require('lodash');
var clientSyncManager = {};
var controller = require('./controller');

/**
 * @param {socket.io.Server} socket
 */
clientSyncManager.setSocket = function(io){
  var self = this;

  io.on('connection', function(socket){
    
    socket.on('user-action', function(obj){
      var action = obj.action;

      if ( ['start', 'stop', 'restart'].indexOf(action) === -1 ){
        self.error('usear-action ' + action + ' does not exist!');
        return;
      }

      controller[action]();
      controller.once(action, function(){
        io.emit('user-action-complete', {
          action: action
        });
      });
    });

  });

  return this;
}


/**
 * @param {String} msg
 */
clientSyncManager.error = function error(msg){
  console.error('client-sync-manager: ' + msg);
}

module.exports = _.bind(clientSyncManager.setSocket, clientSyncManager);