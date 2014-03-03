'use strict';

angular.module('app')
.factory('sync', function(){
  var sync = {},
    socket = io.connect('http://localhost:8400');


  sync.action = function(actionName){
    socket.emit('user-action', actionName);
  };

  socket.on('message', function(msg){
    console.log('message received', msg);
  });

  return sync;
});