// YOUR CODE HERE:
var App = function(){
  this.server = "https://api.parse.com/1/classes/chatterbox";
  this.messages = [];
  this.rooms = {};
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
  $('#chats').append($('<p></p>').text(message.text));
};

App.prototype.addRoom = function(roomname) {
  $('#roomSelect').append($('<option></option>').text(roomname));
};

var app = new App();
app.init();

$(document).on('click', '#submitMsg', function(event){
  event.preventDefault();
  var message = {
    username: 'fsociety',
    text: $('#chatBox').val(),
    roomname: 'hr38'
  };

  app.send(message, function(){
     $('#chatBox').val("");
  });
  app.clearMessages();
  app.init();
});