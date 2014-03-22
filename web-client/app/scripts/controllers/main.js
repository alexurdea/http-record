'use strict';

angular.module('app')
  .controller('MainCtrl', ['sync', function(sync){
    sync.action('start');
  }]);
