'use strict';

describe('Controller: MainCtrl', function () {

  // load the controller's module
  beforeEach(module('app'));
  
  beforeEach(module(function($provide){
    
    // mock up sync
    $provide.factory('sync', function(){
      return {
        action: function(){}
      }
    });

  }))

  var MainCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    
    scope = $rootScope.$new();
    MainCtrl = $controller('MainCtrl', {
      $scope: scope
    });
  }));

  it('should work :)', function () {
    expect(1).toEqual(1);
  });
});
