var express = require('express')
var app = express();
var socketIo = require('socket.io');


/*
Error handling if we are unable to connect to redis
*/

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

  socket.on('join', function(name, room){
  	 socket.join(room);
  	 socket.username = name;
  	 socket.room = room;
  	 socket.emit('chat message', socket.username + " joined.");
     socket.broadcast.to(socket.room).emit('chat message', socket.username + " joined.");
  });

  socket.on('chat message', function(msg){
  	socket.emit('chat message', socket.username + " : "+ msg);
     socket.broadcast.to(socket.room).emit('chat message', socket.username + " : "+ msg);
  });
});

app.use('/', express.static(__dirname + '/app'));
