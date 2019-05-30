const $ = require('jquery');
const io = require('socket.io-client');
const SimplePeer = require('simple-peer');
var wrtc = require('wrtc')


$(document).ready(function(){

    var peer;
    var initiator;
    var joinRequest;
    navigator.getUserMedia({ video: true, audio: false }, gotMedia, () => {})
  
    function gotMedia (stream) {
        console.log('got a stream', stream);
        const video = document.getElementById('localVideo');
        video.srcObject = stream;
        video.play();
        //$('#localVideo').attr("src",window.URL.createObjectURL(stream));

        var room = prompt('Type a room name');

        while($.trim(room) === '')
          room = prompt('Type a room name');

        var socket = io().connect();
        
        socket.on('connect',function(){
          console.log('Connected to Server!');
          console.log('My socket id - ' + socket.id);
          joinRequest = true;
          socket.emit('create or join',room);
        });

        socket.on('roomMessage',function(roomMessage){
          // console.log(`Server sent room message : ${roomMessage.room} - ${roomMessage.id}`);
          // console.log('RoomMessage is Running!');
          peer.signal(JSON.stringify(roomMessage.data));
        });

        socket.on('joined room',function(joinMessage){
          console.log(stream);
          joinRequest = false;
          initiator = joinMessage.initiator;
          console.log('initiator value is ' + initiator);
          if(initiator==true) {
            console.log('initiator is True - Stream is: ' + stream);
            createPeer({initiator:true,stream : stream, wrtc: wrtc});
          }
        });

        socket.on('newcomer',function(message){
          console.log(`A newcomer of the room sent ${message}`);

          if(message.initiator==false) {
            console.log('initiator is False - Stream is: ' + stream);
            createPeer({stream : stream, wrtc: wrtc});
          }
        });

        socket.on('errorMessage',function(message){
          if(joinRequest === true)
          {
            alert(`Sorry. Room ${room} is full. Click OK to try another room.`);
            joinNewRoom();
          }
          console.log('Server sent error message : ' + JSON.stringify(message));
        });

        function joinNewRoom() {
          room = prompt('Type a room name');

          while($.trim(room) === '')
            room = prompt('Type a room name');

          joinRequest = true;
          socket.emit('create or join',room);
        }

        function createPeer(opts) {
            
            console.log('Creating new peer');
            peer = new SimplePeer(opts);
            peer._debug = console.log;
            peer.on('connect', function () {
                console.log('Peer connection established');
            });
          
            peer.on('stream', function (stream) {
                console.log('Streaming Remote Video!');
                const remoteVideo = document.getElementById('remoteVideo');
                remoteVideo.srcObject = stream;
                remoteVideo.play();
            });
          
            peer.on('signal', function (data) {
              console.log('Peer is signaling!');
                const roomMessage = {
                  room : room,
                  data : data,
                  id : socket.id
                };
                socket.emit('roomMessage',roomMessage);
            });

            peer.on('close', function () {
                console.log('Peer closed');
                peer.destroy();
                peer = null;
            });

            peer.on('error', function (error) {
                console.log('Some fatal error occured : ' + error);
            });
        }

    }

});
