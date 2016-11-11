var express = require('express');
var server = express();
var BinaryServer = require('binaryjs').BinaryServer;
var base64 = require('base64-stream');
var Stream = require('stream');
var redis = require("redis");
var fs = require("fs");
path = require('path');

var videoServer = new BinaryServer({server: server, path: '/video-server', port:4705});
var videoPublisher = redis.createClient({'return_buffers': true});

var SERVER_PORT = 8080;

var videoBuffers = new Set();

function getChannelNameFromUrl(url){
  return url.split('?')[1].split('=')[1];
}

function getLastFile(channelName){ //TODO mejorarlo
  var last_tms = 0;
  fs.readdirSync("content/"+channelName).filter(function(file) {
    if(file.substring(file.length-5, file.length) === ".webm"){
      var tms = file.substring(0,file.length-5);//5 de (video)... y 5 de ...(.webm)
      if (parseInt(tms) > parseInt(last_tms)){
        last_tms = tms;
      }  
    }
    
  });
  return last_tms;
}

//GET VIDEO FROM BROWSER AND PUBLISH TO REDIS
videoServer.on('connection', function(client){
  console.log('Binary Server connection started');

  client.on('stream', function(stream, channelName) {
    console.log('>>>Incoming Video stream');
    stream.on("data",function(chunk){
      var milliseconds = new Date().getTime();
      var seconds = parseInt(milliseconds/10000);
      if (!fs.existsSync("content/"+channelName)){
        fs.mkdirSync("content/"+channelName);
      }
      if(!videoBuffers.has(channelName)){
        videoPublisher.publish("channels",channelName);
        videoBuffers.add(channelName);
      }
      videoPublisher.publish(channelName,chunk);
    });
  });
});

server.get('/recorder',function(req,res){
    res.sendFile(__dirname + '/views/recorder.html');
});

server.get('/mock',function(req,res){
    res.sendFile(__dirname + '/views/mock.html');
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

server.get('/get-stream.js',function(req,res){
    res.sendFile(__dirname + '/static/js/get-stream.js');
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

server.get('/getwebm/:channel/last-id',function(req,res){
  res.status(200).send(getLastFile(req.params.channel));
});

server.get('/getwebm/:channel/:id',function(req,res){
    var channelName = req.params.channel;
    var id = req.params.id;

    var file_path = "content/"+channelName;
    var file_name = id+".webm";
    fs.stat(file_path+"/"+file_name, function(err, stat) {
        if(err != null && err.code == 'ENOENT') {
            res.status(404).send('Not found');
        } else if(err != null) {
            console.error('Some other error: ', err.code);
        } else{
          var filePath = path.join(file_path,file_name);
          var stat = fs.statSync(filePath);

          res.writeHead(200, {
              'Content-Type': 'video/webm',
              'Content-Length': stat.size,
              'Access-Control-Allow-Origin':'*',
              'Access-Control-Allow-Credentials':true
          });
          var readStream = fs.createReadStream(filePath);
          readStream.pipe(res);  
        }
        
    });
    
});  

server.listen(SERVER_PORT);