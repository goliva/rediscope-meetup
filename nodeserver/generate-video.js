var redis = require("redis");
var fs = require("fs");
var path = require('path');
var ffmpeg = require('fluent-ffmpeg');
var exec = require('child_process').exec;

var videoSubscriber = redis.createClient(6379);

videoSubscriber.subscribe("process");

videoSubscriber.on("message", function(channel, data) {
		var milliseconds = new Date().getTime();
    var seconds = parseInt(milliseconds/10000);
    var cmd = "ffmpeg -i '"+data+"' -s 320x240 -crf 51 -preset ultrafast "+data.replace("640x480", "320x240");;
    exec(cmd, function(error, stdout, stderr){});
  
});