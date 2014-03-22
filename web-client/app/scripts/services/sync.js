'use strict';

angular.module('app')
.factory('sync', function(){
  var sync = {},
    socket = null;

  try {
    socket = io.connect('http://localhost:8400');
  } catch(e){
    console.log(e);
  }

  socket.on('connect_failed', function(){
    console.log('WTF!');
  });

  socket.on('reconnecting', function(){
    console.log('rec!');
  });

  socket.on('error', function(e){
    console.log('ERRRRR', e);
  });


  /**
   * @param {String} actionName
   */
  sync.action = function(actionName){
    socket.emit('user-action',{
      action: actionName
    });
  };

  socket.on('user-action-complete', function(msg){
    console.log('message received', msg);
  });

  return sync;
});