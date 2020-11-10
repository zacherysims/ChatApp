
  $(function () {

    //Variables being initialized from the DOM, jquery-style
    let $messageArea = $('.messageArea');
    let $messageText = $('.messageText');
    var socket = io();
    $('form').submit(function(e){
      e.preventDefault(); // prevents page reloading
      socket.emit('chat message', $('#m').val());
      $('#m').val('');
      return false;
    });
    socket.on('chat message', function(msg){
      $('#messages').append($('<li>').text(msg));
    });
  });