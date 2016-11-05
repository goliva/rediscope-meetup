var redis = require("redis");
var fs = require("fs");
path = require('path');

var videoSubscriber = redis.createClient(6379);

videoSubscriber.subscribe("process");

videoSubscriber.on("message", function(channel, data) {
  console.log("tengo que procesar el path "+data);
});