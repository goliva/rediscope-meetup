'use strict';

var video;
var canvas;
var videoClient;
var videoStream;
var canvasContext;

function init(){
  video = document.getElementById('video');
  canvas = window.canvas = document.getElementById('sender');
  canvas.width = 640;
  canvas.height = 480;
  canvasContext = canvas.getContext('2d');
  videoClient = new BinaryClient("ws://localhost:4705/video-server");
  videoClient.on('open', function (s) {
    videoStream = videoClient.createStream("golza");
  });
}

var captureFrame = function() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
  var imageData = canvasContext.getImageData(0, 0, canvas.width, canvas.height);
  if (typeof videoStream !== 'undefined') {
      videoStream.write(imageData.data);
  }
};

var constraints = {
  audio: true,
  video: true
};

function handleSuccess(stream) {
  window.stream = stream; // make stream available to browser console
  video.srcObject = stream;
  setInterval(function(){  
    bla(); 
  }, 1000);
}

function handleError(error) {
  console.log('navigator.getUserMedia error: ', error);
}

function bla(){
  captureFrame();
}

init();
navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess).catch(handleError);