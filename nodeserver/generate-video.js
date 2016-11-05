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
  fs.readdirSync("content/"+data).filter(function(file) {
  	if (file !== "content_"+seconds){
  		var cmd = "ffmpeg -framerate 1 -pattern_type glob -i content/"+data+"/"+file+"'/*.jpeg' -s 320x240 content/"+data+"/video"+file.substring(8)+".webm";
  		exec(cmd, function(error, stdout, stderr){
  			if(error == null){
  				console.log("todo ok");
  				deleteFolderRecursive("content/"+data+"/"+file);
  			}

  		});
  	}

  });
});

var deleteFolderRecursive = function(path) {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};