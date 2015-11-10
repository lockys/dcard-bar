$(document).ready(function() {
  var ipc = require('ipc');
  var fs = require('fs');
  var shell = require('shell');
  var quitBtn = $('#quit-btn');
  var settingBtn = $('#setting-btn');
  var refreshBtn = $('#refresh-btn');
  var projectSelect = $('#project-select');
  var DcardLogin = require('dcard-card');

  function refreshPage(s) {
    console.log('refresh');
    s = JSON.parse(s);
    if (!s || !s.user || !s.password) {
      $('.login-box').removeClass('content-hidden');
      return;
    }

    var d = new DcardLogin(s.user, s.password);
    $('.email-input').attr('value', s.user);

    d.letsGetFriend((err, body) => {
      if (!err) {
        $('.image').attr('src', 'https://dcard-photo.s3.amazonaws.com/photo/' + body.photo);
        Object.keys(body).forEach(function(e) {
          $('.' + e).html(body[e] !== '' ? body[e] : '無');
        });

        $('.img-holder').addClass('content-hidden');
      } else {
        swal('讀取失敗，請按左下角重整。');
        console.error(err);
      }
    });
  }

  function closeCredentailForm() {
    $('.login-box').toggleClass('content-hidden');
  }

  quitBtn.click(function() {

    swal({title: '確定離開?',
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#DD6B55',
          confirmButtonText: '確定',
          closeOnConfirm: false,
         },
          function() {
            ipc.send('terminate');
          });
  });

  settingBtn.click(function() {
    closeCredentailForm();
  });

  $('.save-btn').click(function(e) {
    e.preventDefault();
    var user = $('.email-input').val();
    var password = $('.password-input').val();
    var credential = {
      user: user,
      password: password,
    };
    ipc.send('write-user-config', credential);
  });

  $('.leave-btn').click(function(e) {
    e.preventDefault();
    closeCredentailForm();
  });

  $('.clean-btn').click(function(e) {
    e.preventDefault();
    ipc.send('write-user-config', {user: '', password: ''});
  });

  refreshBtn.click(function() {
    location.reload();
  });

  $('.dcard-open-btn').click(function() {
    shell.openExternal('https://www.dcard.tw/dcard');
  });

  $('.issue-btn').click(function() {
    shell.openExternal('https://github.com/lockys/dcard-card-bar');
  });

  ipc.on('refresh', function(arg) {
    refreshPage(arg);
  });

  ipc.on('writeUserData', function(arg) {
    swal('成功 :)');
    location.reload();
  });

  ipc.send('connect-refresh', '');
});
