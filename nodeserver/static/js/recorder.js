'use strict';

var gumVideo = document.getElementById('orig');
var mediaRecorder;
var recordedBlobs = [];
var videoStream;
var videoClient = new BinaryClient("ws://localhost:4705/video-server");
videoClient.on('open', function (s) {
    videoStream = videoClient.createStream("golza");
});

var constraints = {
  audio: true,
  video: true
};

function handleSuccess(stream) {
  console.log('getUserMedia() got stream: ', stream);
  window.stream = stream;
  if (window.URL) {
    gumVideo.src = window.URL.createObjectURL(stream);
  } else {
    gumVideo.src = stream;
  }
}

function handleError(error) {
  console.log('navigator.getUserMedia error: ', error);
}

navigator.mediaDevices.getUserMedia(constraints).
    then(handleSuccess).catch(handleError);

function handleDataAvailable(event) {
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data);
    //videoStream.write(recordedBlobs);
    stopRecording();
    play(recordedBlobs);
    startRecording();
  }
}

function startRecording() {
  recordedBlobs = [];
  var options = {mimeType: 'video/webm;codecs=vp9'};
  if (!MediaRecorder.isTypeSupported(options.mimeType)) {
    console.log(options.mimeType + ' is not Supported');
    options = {mimeType: 'video/webm;codecs=vp8'};
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      console.log(options.mimeType + ' is not Supported');
      options = {mimeType: 'video/webm'};
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.log(options.mimeType + ' is not Supported');
        options = {mimeType: ''};
      }
    }
  }
  try {
    mediaRecorder = new MediaRecorder(window.stream, options);
  } catch (e) {
    console.error('Exception while creating MediaRecorder: ' + e);
    alert('Exception while creating MediaRecorder: '
      + e + '. mimeType: ' + options.mimeType);
    return;
  }
  console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start(1000); // collect 10ms of data
  console.log('MediaRecorder started', mediaRecorder);
}

function stopRecording() {
  try{mediaRecorder.stop();}catch(e){};
  console.log('Recorded Blobs: ', recordedBlobs);
}


//////Reproducir/////

var recordedVideo = document.querySelector('dest');

function play(a) {
  console.log(a);
  var superBuffer = new Blob(a, {type: 'video/webm'});
  console.log(superBuffer);
  recordedVideo.src = window.URL.createObjectURL(superBuffer);
}