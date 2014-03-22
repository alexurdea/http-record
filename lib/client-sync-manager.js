/*
Client Sync Manager
===================

It listens for 'user-action', replies with 'user-action-complete', and an object that might
contain an error field, as received from the controller.
*/
'use strict';

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
      var options = obj.options || {};

      if ( ['start', 'stop', 'restart'].indexOf(action) === -1 ){
        self.error('usear-action ' + action + ' does not exist!');
        return;
      }

      controller[action](options);
      controller.once(action, function(res){
        socket.emit('user-action-complete', {
          action: action,
          result: res,
          error: res.error
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