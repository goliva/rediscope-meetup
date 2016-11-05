var express = require('express');
var server = express();
var BinaryServer = require('binaryjs').BinaryServer;
var base64 = require('base64-stream');
var Stream = require('stream');
var redis = require("redis");
var fs = require("fs");
path = require('path');

//audio
/*var audioServer = new BinaryServer({server: server, path: '/audio-server', port:4702});
var audioClient = new BinaryServer({server: server, path: '/audio-client', port:4703});*/

//video
var videoServer = new BinaryServer({server: server, path: '/video-server', port:4705});
//var videoClient = new BinaryServer({server: server, path: '/video-client', port:4706});

/*var audioPublisher = redis.createClient();
var audioSubscriber = redis.createClient(6379);*/
var videoPublisher = redis.createClient();
//var videoSubscriber = redis.createClient(6379);

var SERVER_PORT = 8080;

var videoBuffers = new Set();
//var audioBuffers = {};

//process.setMaxListeners(0);

function getChannelNameFromUrl(url){
  return url.split('?')[1].split('=')[1];
}

//GET VIDEO FROM BROWSER AND PUBLISH TO REDIS
videoServer.on('connection', function(client){
  console.log('Binary Server connection started');

  client.on('stream', function(stream, channelName) {
    console.log('>>>Incoming Video stream');
    stream.on("data",function(chunk){
      if(!videoBuffers.has(channelName)){
        videoPublisher.publish("channels",channelName);
        videoBuffers.add(channelName);
      }
      var base64Data = chunk.replace(/^data:image\/jpeg;base64,/,""),
      binaryData = new Buffer(base64Data, 'base64').toString('binary');
      
      videoPublisher.publish(channelName,binaryData);
    });

    stream.on('end', function() {
      console.log('||| Video stream ended');
    });
  });
});

//GET VIDEO FROM REDIS AND EMIT TO CLIENT BROWSER
/*videoClient.on('connection', function(client) {

  var channelName = getChannelNameFromUrl(client._socket.upgradeReq.url);
  if(videoBuffers[channelName+':video'] !== undefined){
    console.log(">>>Incoming audio client. Connected: " + (videoBuffers[channelName+':video'].length + 1));
    var responseStream = client.createStream('fromserver');
    var bufferStream = new Stream();
    bufferStream.pipe(responseStream);
    videoBuffers[channelName+':video'].push(bufferStream);
  }
});*/

var lastFrame = new Map();
/*videoSubscriber.subscribe("channels");


videoSubscriber.on("message", function(channel, data) {
  if(channel === "channels"){
    videoSubscriber.subscribe(data);    
  }else{
    var milliseconds = new Date().getTime();
    var seconds = parseInt(milliseconds/10000);
    if (!fs.existsSync("content/content_"+channel+"_"+seconds)){
      fs.mkdirSync("content/content_"+channel+"_"+seconds);
    }
    fs.writeFile("content/content_"+channel+"_"+seconds+"/out"+milliseconds+".jpeg", data, "binary", function(err) {});
  }
});*/

/*
audioServer.on('connection', function(client){
  console.log('Binary Server connection started');

  client.on('stream', function(stream, channelName) {
    console.log('>>>Incoming audio stream');
    stream.on("data",function(chunk){
      if(audioBuffers[channelName+':audio'] === undefined){
        audioBuffers[channelName+':audio'] = [];
        audioSubscriber.subscribe(channelName + ':audio');
      }
      
      //var base64Data = chunk.replace(/^data:image\/png;base64,/,""),
      //binaryData = new Buffer(base64Data, 'base64').toString('binary');
      //require("fs").writeFile("imgs/out"+new Date().getTime()+".wav", chunk, "binary", function(err) {});


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
*/

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

server.get('/getwebm/:id',function(req,res){
    var filePath = path.join("content","video"+req.params.id+".webm");
    var stat = fs.statSync(filePath);

    res.writeHead(200, {
        'Content-Type': 'video/webm',
        'Content-Length': stat.size,
        'Access-Control-Allow-Origin':'*',
        'Access-Control-Allow-Credentials':true
    });

    var readStream = fs.createReadStream(filePath);
    // We replaced all the event handlers with a simple call to readStream.pipe()
    readStream.pipe(res);
});


server.listen(SERVER_PORT);