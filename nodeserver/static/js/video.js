var recordedBlobs = [];
var recordedVideo = document.querySelector('video');

function play(a) {
  var superBuffer = new Blob(a, {type: 'video/webm'});
  recordedVideo.src = window.URL.createObjectURL(superBuffer);
}

function GET() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', "/getframe/golza", true);
  xhr.responseType = 'video/webm';
  xhr.send();

  xhr.onload = function(e) {
    if (xhr.status != 200) {
      alert("Unexpected status code " + xhr.status + " for " + url);
      return false;
    }
    var a = new Blob(xhr.response);
    play(a);
  };
}