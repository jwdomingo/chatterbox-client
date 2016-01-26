// YOUR CODE HERE:
var App = function(){
  this.server = "https://api.parse.com/1/classes/chatterbox";
  this.messages = [];
  this.rooms = {};
  this.friends = {};
};

App.prototype.init = function(){
  var self = this;
  this.fetch(function(data){
    roomKey = {};
    self.messages = data.results;

    _.each( data.results,
      function(msg){
        self.addMessage(msg);
        roomKey[msg.roomname] = roomKey[msg.roomname] || [];
        roomKey[msg.roomname].push(msg);
    });

    self.rooms = roomKey;

    _.each(self.rooms,function(val,key){
      self.addRoom(key);
    });
  });
};

App.prototype.send = function(message, _successCallBack) {
  return $.ajax({
    url: 'https://api.parse.com/1/classes/chatterbox',
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      if(_successCallBack){
        _successCallBack(data);
      }
      console.log('chatterbox: Message sent');
    },
    error: function (data) {
      console.error('chatterbox: Failed to send message');
    }
  });
};

App.prototype.fetch = function(_successCallBack) {
  return $.ajax({
    url: 'https://api.parse.com/1/classes/chatterbox',
    type: 'GET',
    data: {'order': '-updatedAt'},
    contentType: 'application/json',
    success: function (data) {
      if(_successCallBack){
        _successCallBack(data);
      }
      return data;
    },
    error: function (data) {
      console.error('chatterbox: Failed to fetch messages');
    }
  });
};

App.prototype.clearMessages = function(){
  $('#chats').children().remove();
};

App.prototype.addMessage = function(message) {
  var time = new Date(message.createdAt);
  var h = time.getHours();
  var m = time.getMinutes();

	var $message = $('<div class="message"></div>');

	$('<a href="#" class="user-name"></a>').text(message.username).appendTo($message);

	$('<time></time>').attr('datetime', message.createdAt).text(h + ':' + m + (h < 12 ? ' AM' : ' PM')).appendTo($message);

	$('<p></p>').text(message.text).appendTo($message);

	$('#chats').prepend($message);

	$('#chats').scrollTop = $('#chats').scrollHeight;
};

App.prototype.addRoom = function(roomname) {
  $('ul#rooms').append($('<li></li>').text(roomname));
};

App.prototype.addFriend = function(event) {
  event.preventDefault();
  var friend = $(this).text();
  if (!app.friends[friend]) {
    $('#friendSelect').append($('<option></option>').text($(this).text()));
    app.friends[friend] = true;
  }
};

var app = new App();
app.init();

$(document).on('click', '#submitMsg', function(event){
  event.preventDefault();
  var message = {
    username: 'fsociety',
    text: $('#chatBox').val(),
    roomname: 'lobby'
  };

  app.send(message, function(){
     $('#chatBox').val("");
  });
  app.clearMessages();
  app.init();
});

$(document).on('click', 'a.user-name', app.addFriend);

// var attackMsg = function(inputScript){
//   return {
//     roomname: inputScript,
//     text: inputScript,
//     username: inputScript
//   };
// };
// var input= '&lt;script&gt;&#36;(&#39;&#35;chats&#39;).css(&#39;background&#39;,&#39;pink&#39;);&lt;/script&gt;';
// var input2='&lt;script&gt;console.log(&#x27;xss&#x27;);&lt;/script'
