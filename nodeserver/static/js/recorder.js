'use strict';

var video = document.getElementById('video');
var recordedBlobs = [];
var videoStream;
var mediaRecorder;
var videoClient = new BinaryClient("ws://localhost:4705/video-server");
videoClient.on('open', function (s) {
    videoStream = videoClient.createStream("golza");
});

var constraints = {
  audio: false,
  video: true
}

function handleSuccess(stream) {
    video.src = window.URL.createObjectURL(stream);
    window.stream = stream;
    video.play();
    startRecording();
}

function handleError(error) {
    console.log('navigator.getUserMedia error: ', error);
}

navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess).catch(handleError);

function handleDataAvailable(event) {
  if (event.data && event.data.size > 0) {
    console.log(event.data);
    videoStream.write(event.data);
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