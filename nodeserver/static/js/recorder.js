'use strict';

var video;
var canvas;
var videoClient;
var audioClient;
var videoStream;
var audioStream;

function init(){
  video = document.getElementById('video');
  canvas = window.canvas = document.getElementById('sender');
  canvas.width = 640;
  canvas.height = 480;
  videoClient = new BinaryClient("ws://localhost:4705/video-server");
  

  videoClient.on('open', function (s) {
    videoStream = videoClient.createStream("golza");
  });

  audioClient = new BinaryClient("ws://localhost:4702/audio-server");
  audioClient.on('open', function (s) {
    audioStream = audioClient.createStream("golza");
  });
}

var captureFrame = function() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
  if (typeof videoStream !== 'undefined') {
      videoStream.write(canvas.toDataURL("image/jpeg"));
  }
};

var constraints = {
  audio: true,
  video: true
};

function setUpAudio(stream){

  var audioContext = window.AudioContext || window.webkitAudioContext;
  var context = new audioContext();

  // the sample rate is in context.sampleRate
  var audioInput = context.createMediaStreamSource(stream);

  var bufferSize = 16384;
  var recorder = context.createScriptProcessor(bufferSize, 4, 4);

  recorder.onaudioprocess = function(stream){
    var left = stream.inputBuffer.getChannelData(0);
    audioStream.write(left);
  }

  audioInput.connect(recorder)
  recorder.connect(context.destination);
}

function handleSuccess(stream) {
  window.stream = stream;
  video.srcObject = stream;
  setUpAudio(stream);
  setInterval(function(){  
    captureFrame(); 
  }, 1000);
}

function handleError(error) {
  console.log('navigator.getUserMedia error: ', error);
}

init();
navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess).catch(handleError);