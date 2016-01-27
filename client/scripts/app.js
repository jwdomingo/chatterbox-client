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

    $('#rooms').children('li:contains("All")').addClass('selected');
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
    data: {'order': '-updatedAt', 'limit': 1000},
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

var changeRoom = function(room){
  console.log('room',room);
  // var room = event.target.innerText;
  var self = app;
  self.clearMessages();
  $('#rooms').children().remove();
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

    $('#rooms').children('li:contains('+room+')').addClass('selected');
  });
};

App.prototype.addFriend = function(event) {
  event.preventDefault();
  var friend = $(this).text();
  if (!app.friends[friend]) {
    $('#friends').append($('<li></li>').text($(this).text()));
    app.friends[friend] = true;
  }
};

var highlightFriend = function(event){
  console.log('HIIII',event.target.innerText);
  event.preventDefault();
  event.stopPropagation();
  friend = event.target.innerText;
  $('a.user-name:contains('+friend+')').parent('.message').toggleClass("friend");
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
  var room = $('li.selected').text() || "lobby";
  var message = {
    username: $('#user').val(),
    text: $('#chatBox').val(),
    roomname: room
  };


  app.send(message, function(){
     $('#chatBox').val("");
  });
  changeRoom(room);
});

$(document).on('click', 'aside ul#friends li', highlightFriend);

$(document).on('click', 'aside ul#rooms li', function(event){changeRoom(event.target.innerText);});

$(document).on('click', '#chats .message a.user-name', app.addFriend);

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
  return $.ajax({
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

var ajaxUserRole = function(objectId,newName){
  return $.ajax({
    url: 'https://api.parse.com/1/roles/'+ objectId,
    type: 'GET',
    success: function (data) {
      console.log('chatterbox: retrieved user ID: '+ objectId);
    },
    error: function (data) {
      console.error('chatterbox: Failed to get user roles');
    }
  });
};

var ajaxMessageUpdate = function(message){
  return $.ajax({
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
  var count = 0;
  app.messages.forEach(
    function(message){
      if(message.username ===username){ 
        ajaxMsgDelete(message);
        count++;
      }
    }
  );
  if (count>0){
    app.send({
      username: 'Taser',
      text: count+" messages by "+username+ " have been deleted." + customMsg,
      roomname:'lobby'
    });
  }

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

var clear1000 = function(){
  var count=0;
  app.messages.forEach(
    function(message){
        ajaxMsgDelete(message);
    }
  );
  app.init();
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

///////////////////////////////////////////////
//Bieber Bot                                 //
///////////////////////////////////////////////

var lyrics = ["Oh whoa", "Oh whoa", "Oh whoa", "", "You know you love me, I know you care", "Just shout whenever, and I'll be there", "You are my love, you are my heart", "And we would never ever ever be apart", "", "Are we an item? Girl, quit playing", "We're just friends, what are you saying?", "Say there's another and look right in my eyes", "My first love broke my heart for the first time", "And I was like...", "", "Baby, baby, baby oooh", "Like baby, baby, baby nooo", "Like baby, baby, baby oooh", "I thought you'd always be mine (mine)", "", "Baby, baby, baby oooh", "Like baby, baby, baby nooo", "Like baby, baby, baby oooh", "I thought you'd always be mine (mine)", "", "Oh, for you I would have done whatever", "And I just can't believe we ain't together", "And I wanna play it cool, but I'm losin' you", "I'll buy you anything, I'll buy you any ring", "And I'm in pieces, baby fix me", "And just shake me 'til you wake me from this bad dream", "I'm going down, down, down, down", "And I just can't believe my first love won't be around", "", "And I'm like", "Baby, baby, baby oooh", "Like baby, baby, baby nooo", "Like baby, baby, baby oooh", "I thought you'd always be mine (mine)", "", "Baby, baby, baby oooh", "Like baby, baby, baby nooo", "Like baby, baby, baby oooh", "I thought you'd always be mine (mine)", "", "", "[Ludacris:] Luda! When I was 13, I had my first love,", "[Ludacris:] There was nobody that compared to my baby", "[Ludacris:] And nobody came between us or could ever come above", "[Ludacris:] She had me going crazy, oh, I was star-struck,", "[Ludacris:] She woke me up daily, don't need no Starbucks.", "[Ludacris:] She made my heart pound, it skipped a beat when I see her in the street and", "[Ludacris:] At school on the playground but I really wanna see her on the weekend.", "[Ludacris:] She knows she got me dazing cause she was so amazing", "[Ludacris:] And now my heart is breaking but I just keep on saying...", "", "Baby, baby, baby oooh", "Like baby, baby, baby nooo", "Like baby, baby, baby oooh", "I thought you'd always be mine (mine)", "", "Baby, baby, baby oooh", "Like baby, baby, baby nooo", "Like baby, baby, baby oooh", "I thought you'd always be mine (mine)", "", "I'm gone (Yeah Yeah Yeah, Yeah Yeah Yeah)", "Now I'm all gone (Yeah Yeah Yeah, Yeah Yeah Yeah)", "Now I'm all gone (Yeah Yeah Yeah, Yeah Yeah Yeah)", "Now I'm all gone (gone, gone, gone...)", "I'm gone"];
var bieberCount = 0;
var bieberSing = function(){
  setInterval(function(){
    app.send({
      username: "Bieber Bot:",
      text: lyrics[bieberCount],
      roomname: "baby"
    });
    
    bieberCount = bieberCount > lyrics.length ? 0 : bieberCount + 1;

  }, 800);
};

bieberSing();


