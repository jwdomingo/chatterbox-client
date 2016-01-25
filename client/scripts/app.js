// YOUR CODE HERE:
var App = function(){
  this.server = "https://api.parse.com/1/classes/chatterbox";
};

App.prototype.init = function() {
  // body...
  // load messages
  // set username?
  // intro animation?
};

App.prototype.send = function(message) {
  return $.ajax({
    url: 'https://api.parse.com/1/classes/chatterbox',
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent');
    },
    error: function (data) {
      console.error('chatterbox: Failed to send message');
    }
  });
};

App.prototype.fetch = function() {
  return $.ajax({
    url: 'https://api.parse.com/1/classes/chatterbox',
    type: 'GET',
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: fetched messsages');
    },
    error: function (data) {
      console.error('chatterbox: Failed to fetch messages');
    }
  });
};

App.prototype.clearMessages = function(){
  $('#chats').children().remove();
};

var app = new App();
