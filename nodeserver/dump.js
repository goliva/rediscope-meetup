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
    if (!fs.existsSync("content/content_"+channel+"_"+seconds)){
      fs.mkdirSync("content/content_"+channel+"_"+seconds);
      videoPublisher.publish("process",channel);
    }
    fs.writeFile("content/content_"+channel+"_"+seconds+"/out"+milliseconds+".jpeg", data, "binary", function(err) {});
  }
});