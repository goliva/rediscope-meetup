var redis = require("redis");
var fs = require("fs");
path = require('path');

var videoPublisher = redis.createClient();
var videoSubscriber = redis.createClient(6379);

videoSubscriber.subscribe("channels");

videoSubscriber.on("message", function(channel, data) {
  if(channel === "channels"){
    videoSubscriber.subscribe(data);    
  }else{
    var milliseconds = new Date().getTime();
    var seconds = parseInt(milliseconds/10000);
    if (!fs.existsSync("content/"+channel)){
      fs.mkdirSync("content/"+channel);
    }
    if (!fs.existsSync("content/"+channel+"/content_"+seconds)){
      fs.mkdirSync("content/"+channel+"/content_"+seconds);
      videoPublisher.publish("process",channel);
    }
    fs.writeFile("content/"+channel+"/content_"+seconds+"/out"+milliseconds+".jpeg", data, "binary", function(err) {});
  }
});