var redis = require("redis");
var fs = require("fs");
var path = require('path');
var ffmpeg = require('fluent-ffmpeg');
var exec = require('child_process').exec;

var videoSubscriber = redis.createClient(6379);

videoSubscriber.subscribe("process");

var flag = false;

videoSubscriber.on("message", function(channel, data) {
	console.log("llaman");
	if (flag){
		console.log("no hago nada");
	}else{
		console.log("a la carga!");
		flag=true;
		var milliseconds = new Date().getTime();
  var seconds = parseInt(milliseconds/10000);
  fs.readdirSync("content/"+data).filter(function(file) {
  	if (file !== "content_"+seconds && file.substring(file.length-5, file.length) !== ".webm"){
  		console.log("generando para "+file);
  		var cmd = "ffmpeg -framerate 12 -pattern_type glob -i content/"+data+"/"+file+"'/*.jpeg' -s 320x240 content/"+data+"/video"+file.substring(8)+".webm";
  		exec(cmd, function(error, stdout, stderr){
  			if(error == null){
  				var milliseconds2 = new Date().getTime();
  				console.log("todo ok: "+(milliseconds2-milliseconds));
  				deleteFolderRecursive("content/"+data+"/"+file);
  				flag=false;
  			}

  		});
  	}

  });
	}
  
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