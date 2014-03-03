var EventEmitter = require('events').EventEmitter;
var proxyquire = require('proxyquire');
var util = require('util');

describe('client-sync-manager', function(){
  var actionCalled, errorSpy,
    // mocks:
    io, controller, socket;

  var clientSyncManager;
  var Controller = new Function();
  util.inherits(Controller, EventEmitter);


  beforeEach(function(){
    io = new EventEmitter();
    socket = new EventEmitter();
    controller = new EventEmitter();
    // controller = jasmine.createSpyObj('controller', ['start', 'stop', 'restart']);

    var controller = new Controller();
    
    controller.start = createSpy('start').andCallFake(function(){
      actionCalled = 'start';
    });
    controller.stop = createSpy('stop').andCallFake(function(){
      actionCalled = 'stop';
    });
    controller.restart = createSpy('restart').andCallFake(function(){
      actionCalled = 'restart';
    });

    actionCalled = null;
    clientSyncManager = proxyquire('../lib/client-sync-manager', { './controller': controller })(io);
    io.emit('connection', socket);
    errorSpy = spyOn(clientSyncManager, 'error');
  });


  it('should take error-specific actions when a method that is not allowed is called', function(){
    var incorrectAction = 'does-not-exist!';

    socket.emit('user-action', {
      action: incorrectAction
    });

    expect(errorSpy).toHaveBeenCalledWith('usear-action ' + incorrectAction + ' does not exist!');
  });


  it('should start the recording/replaying when this command arrives on the socket', function(){
    socket.emit('user-action', {
      action: 'start'
    });
    expect(actionCalled).toBe('start');
  });


  it('should stop the recording/replaying when this command arrives on the socket', function(){
    socket.emit('user-action', {
      action: 'stop'
    });
    expect(actionCalled).toBe('stop');
  });


  it('should restart the recording/replaying when this command arrives on the socket', function(){
    socket.emit('user-action', {
      action: 'restart'
    });
    expect(actionCalled).toBe('restart');
  });


});