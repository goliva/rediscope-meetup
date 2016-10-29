var express = require('express');
var server = express();
var BinaryServer = require('binaryjs').BinaryServer;
var base64 = require('base64-stream');
var Stream = require('stream');
var redis = require("redis");


//audio
var audioServer = new BinaryServer({server: server, path: '/audio-server', port:4702});
var audioClient = new BinaryServer({server: server, path: '/audio-client', port:4703});

//video
var videoServer = new BinaryServer({server: server, path: '/video-server', port:4705});
var videoClient = new BinaryServer({server: server, path: '/video-client', port:4706});

var audioPublisher = redis.createClient();
var audioSubscriber = redis.createClient(6379);
var videoPublisher = redis.createClient();
var videoSubscriber = redis.createClient(6379);

var SERVER_PORT = 8080;

var videoBuffers = {};
var audioBuffers = {};

process.setMaxListeners(0);

function renderLowerResolution(original){
  var newChunk = [];
  for(var i=0; i < original.length; i=i+8){
    for(var j=0; j < 4; j++){
      newChunk[(i/2)+j]= original[i+j];
    }
  }
  return new Buffer(newChunk);
}

//GET VIDEO FROM BROWSER AND PUBLISH TO REDIS
videoServer.on('connection', function(client){
  console.log('Binary Server connection started');

  client.on('stream', function(stream, channelName) {
    console.log('>>>Incoming Video stream');
    stream.on("data",function(chunk){
      if(videoBuffers[channelName+':video'] === undefined){
        videoBuffers[channelName+':video'] = [];
        videoBuffers[channelName+'10:video'] = [];
        videoBuffers[channelName+'9:video'] = [];
        videoBuffers[channelName+'8:video'] = [];
        videoBuffers[channelName+'7:video'] = [];
        videoBuffers[channelName+'6:video'] = [];
        videoSubscriber.subscribe(channelName+ "10:video");
        videoSubscriber.subscribe(channelName+ "9:video");
        videoSubscriber.subscribe(channelName+ "8:video");
        videoSubscriber.subscribe(channelName+ "7:video");
        videoSubscriber.subscribe(channelName+ "6:video");

      }
      
      var base64Data = chunk.replace(/^data:image\/png;base64,/,""),
      binaryData = new Buffer(base64Data, 'base64').toString('binary');
      require("fs").writeFile("imgs/out"+new Date().getTime()+".png", binaryData, "binary", function(err) {});

      videoPublisher.publish(channelName + "10:video",chunk.toString('base64'));
      var halfResolution = renderLowerResolution(chunk);
      videoPublisher.publish(channelName + "9:video",halfResolution.toString('base64'));
      halfResolution = renderLowerResolution(halfResolution);
      videoPublisher.publish(channelName + "8:video",halfResolution.toString('base64'));
      halfResolution = renderLowerResolution(halfResolution);
      videoPublisher.publish(channelName + "7:video",halfResolution.toString('base64'));
      halfResolution = renderLowerResolution(halfResolution);
      videoPublisher.publish(channelName + "6:video",halfResolution.toString('base64'));
      
    });

    stream.on('end', function() {
      console.log('||| Video stream ended');
    });
  });
});

//GET VIDEO FROM REDIS AND EMIT TO CLIENT BROWSER
videoClient.on('connection', function(client) {

  var channelName = getChannelNameFromUrl(client._socket.upgradeReq.url);
  if(videoBuffers[channelName+':video'] !== undefined){
    console.log(">>>Incoming audio client. Connected: " + (videoBuffers[channelName+':video'].length + 1));
    var responseStream = client.createStream('fromserver');
    var bufferStream = new Stream();
    bufferStream.pipe(responseStream);
    videoBuffers[channelName+':video'].push(bufferStream);
  }
});

var lastFrame = new Map();

videoSubscriber.on("message", function(channel, data) {
  var deletedClients = [];
  var mybuffer = new Buffer(data,'base64');
  lastFrame.set(channel, mybuffer);
  for(var i = 0;i < videoBuffers[channel].length;i++) {
    try {
      var bufferStream = videoBuffers[channel][i];
      bufferStream.emit('data',mybuffer);
    } catch(e) {
      videoBuffers[channel][i].close();
      deletedClients.push(i);
    }
  }

  for(index in deletedClients){
    videoBuffers[channel].splice(deletedClients[index],1);
  }
});

audioServer.on('connection', function(client){
  console.log('Binary Server connection started');

  client.on('stream', function(stream, channelName) {
    console.log('>>>Incoming audio stream');
    stream.on("data",function(chunk){
      if(audioBuffers[channelName+':audio'] === undefined){
        audioBuffers[channelName+':audio'] = [];
        audioSubscriber.subscribe(channelName + ':audio');
      }
      audioPublisher.publish(channelName + ':audio',chunk.toString('base64'));
    });

    stream.on('end', function() {
      console.log('||| Audio stream ended');
    });
  });
});

audioClient.on('connection', function(client){
  console.log(">>>Incoming audio client");
  var channelName = getChannelNameFromUrl(client._socket.upgradeReq.url);
  if(audioBuffers[channelName+':audio'] !== undefined){
    audioBuffers[channelName+':audio'].push(client);
  }
});

audioSubscriber.on("message", function(channel, data) {
  var mybuffer = new Buffer(data,'base64');
  var deletedClients = [];
  try{
    for(var i = 0;i < audioBuffers[channel].length;i++){
      var responseStream = audioBuffers[channel][i].createStream('fromserver');
      var bufferStream = new Stream();
      bufferStream.pipe(responseStream);
      bufferStream.emit('data',mybuffer);
    }
  }catch(e){
      audioBuffers[channel][i].close();
      deletedClients.push(i);
  }

  for(index in deletedClients){
    audioBuffers[channel].splice(deletedClients[index],1);
  }
});

server.get('/recorder',function(req,res){
    res.sendFile(__dirname + '/views/recorder.html');
});

server.get('/styles.css',function(req,res){
    res.sendFile(__dirname + '/static/css/styles.css');
});

server.get('/rediscope.png',function(req,res){
    res.sendFile(__dirname + '/static/img/rediscope.png');
});

server.get('/recorder.js',function(req,res){
    res.sendFile(__dirname + '/static/js/recorder.js');
});

server.get('/video.js',function(req,res){
    res.sendFile(__dirname + '/static/js/video.js');
});

server.get('/modernizr.min.js',function(req,res){
    res.sendFile(__dirname + '/static/js/modernizr.min.js');
});

server.get('/jquery.min.js',function(req,res){
    res.sendFile(__dirname + '/static/js/jquery.min.js');
});

server.get('/binary.min.js',function(req,res){
    res.sendFile(__dirname + '/static/js/binary.min.js');
});

server.get('/video',function(req,res){
    res.sendFile(__dirname + '/views/video.html');
});

server.get('/',function(req,res){
    res.sendFile(__dirname + '/views/index.html');
});

server.get('/getframe/:id',function(req,res){
    var data = lastFrame.get(req.params.id+':video');
    res.writeHead(200,{
            'Content-Type': 'text/html'
        });

    res.end(JSON.stringify(data), 'utf8');
});

server.listen(SERVER_PORT);

function getChannelNameFromUrl(url){
  return url.split('?')[1].split('=')[1];
}
