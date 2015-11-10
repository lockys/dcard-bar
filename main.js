var menubar = require('menubar');
var ipc = require('ipc');
var fs = require('fs');
var e;

var mb = menubar({
  dir: __dirname + '/app',
  width: 650,
  height: 490,
  preloadWindow: false,
});

var path = mb.app.getPath('userData');

mb.on('ready', function ready() {
  console.log('app is ready');
});

mb.on('after-show', function() {
  if (e) {
    fs.readFile(path + '/.s.json', 'utf8', function(err, s) {
      e.sender.send('refresh', s);
    });
  }
});

ipc.on('connect-refresh', function(event, arg) {
  e = event;
  fs.readFile(path + '/.s.json', 'utf8', function(err, s) {
    event.sender.send('refresh', s);
  });
});

ipc.on('terminate', function() {
  mb.app.quit();
});

ipc.on('write-user-config', function(event, arg) {
  fs.writeFile(path + '/.s.json', JSON.stringify(arg), function(err) {
    if (err) {
      console.error(err);
    } else {
      console.log('success!');
      event.sender.send('writeUserData', '');
    }
  });
});

ipc.on('read-user-config', function(event, arg) {
  fs.readFile(path + '/.s.json', 'utf8', function(err, s) {
    event.sender.send('readUserData', s);
  });
});
