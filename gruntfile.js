/***
Building Windows Installer
***/
module.exports = function(grunt) {
  grunt.initConfig({
    'create-windows-installer': {
      x64: {
        appDirectory: '/dcard-card-bar-win32-x64/',
        outputDirectory: '/tmp/build/installer64',
        authors: 'lockys',
        exe: 'dcard-card-bar-win32-installer.exe',
      },
    },
  });
  grunt.loadNpmTasks('grunt-electron-installer');
  grunt.task.registerTask('default', ['create-windows-installer']);
};
