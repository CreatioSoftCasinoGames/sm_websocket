var express = require('express')
var app = express();
var config = require('./config')
var socketIo = require('socket.io');
var redis = require("redis");

var client = redis.createClient(config.redis.port, config.redis.host,{});
var clientForChat = redis.createClient(config.redis.port, config.redis.host,{});
var clientForJoin = redis.createClient(config.redis.port, config.redis.host,{});

/*
Error handling if we are unable to connect to redis
*/
client.on("error", function(err){
  console.log("Error %s", error);
});


var server = app.listen(3000, function(){
  console.log('listening on port :3000');
})

var io = socketIo.listen(server);

app.get('/', function(req, res){
  res.sendFile(__dirname +'/app/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.rooms=[{name: 'room1', id: 1},{name: 'room2', id: 2}];

  socket.emit('rooms', socket.rooms);

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  socket.on('join', function(info){
    socket.join(info.room);
    socket.username = info.username;
    socket.room = info.room;
    client.publish("join message",JSON.stringify({room: info.room ,message: socket.username + " joined."});
  });

  socket.on('chat message', function(msgObj){
    client.publish("chat message" , JSON.stringify({room: socket.room, message: socket.username + " : "+ msgObj.message}));
  });
});

clientForChat.on("message", function (channel, messageString) {
  var messageObject = JSON.parse(messageString);
  console.log("chat event catched : " + messageObject.room + " : "+messageObject.message);
  io.to(messageObject.room).emit('chat message', messageObject.message);
});

clientForJoin.on("message", function (channel, messageString) {
  var messageObject = JSON.parse(messageString);
  console.log("join event catched : " + messageObject.room + " : "+messageObject.message);
  io.to(messageObject.room).emit('chat message', messageObject.message);
});

clientForChat.subscribe("chat message");
clientForJoin.subscribe("join message");

app.use('/', express.static(__dirname + '/app'));