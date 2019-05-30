// server.js
// where your node app starts

// init project
const express = require('express');
const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var connectedRoom;

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));
app.use(express.static('socket.io'));
// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

io.on('connection', socket => {
  socket.on('create or join', room => {
    if (io.sockets.adapter.rooms[room] == null) 
    {
      connectedRoom = room;
      socket.join(room);
      io.to(room).emit('newcomer', {initiator: false});
      console.log(io.sockets.adapter.rooms[room].length);
      console.log('New comer has joined room - ' + room)
    }
    else if(io.sockets.adapter.rooms[room].length < 2) {
      console.log(io.sockets.adapter.rooms[room].length);
      socket.join(room);
      io.to(room).emit('joined room', {initiator: true});
    }
    else socket.emit('errorMessage', 'Room fulled');
  });
  
  socket.on('roomMessage', message => {
    socket.to(connectedRoom).emit('roomMessage', message);
  });
  
});

// listen for requests :)

const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});

var iolisten = io.listen(listener);