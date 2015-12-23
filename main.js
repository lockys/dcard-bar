var menubar = require('menubar');
var ipc = require('ipc');
var fs = require('fs');
var cp = require('child_process');
var e;

var mb = menubar({
  dir: __dirname + '/app',
  width: 650,
  height: 490,
  preloadWindow: false,
});

var path = mb.app.getPath('userData');
var schedule = require('node-schedule');
var notifier = require('node-notifier');
var p = require('path');

var j = schedule.scheduleJob('15 0 0 * * *', function() {
  notifier.notify({
    title: '午夜十二點來臨!',
    message: '趕快點我看看你今天抽到誰!',
    icon: p.join('http://www.iconpng.com/png/windows8_icons2/D.png'),
    wait: true,
  });
});

notifier.on('click', function(notifierObject, options) {
  console.log('click!');
  mb.showWindow();
});

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

var handleSquirrelEvent = function() {
   if (process.platform != 'win32') {
      return false;
   }

   function executeSquirrelCommand(args, done) {
      var updateDotExe = p.resolve(p.dirname(process.execPath), 
         '..', 'update.exe');
      var child = cp.spawn(updateDotExe, args, { detached: true });
      child.on('close', function(code) {
         done();
      });
   };

   function install(done) {
      var target = p.basename(process.execPath);
      executeSquirrelCommand(["--createShortcut", target], done);
   };

   function uninstall(done) {
      var target = p.basename(process.execPath);
      executeSquirrelCommand(["--removeShortcut", target], done);
   };

   var squirrelEvent = process.argv[1];
   switch (squirrelEvent) {
      case '--squirrel-install':
         install(mb.app.quit);
         return true;
      case '--squirrel-updated':
         install(mb.app.quit);
         return true;
      case '--squirrel-obsolete':
         mb.app.quit();
         return true;
      case '--squirrel-uninstall':
         uninstall(mb.app.quit);
         return true;
   }

   return false;
};

if (handleSquirrelEvent()) {
   return;
}