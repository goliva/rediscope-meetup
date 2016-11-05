var video = document.querySelector('video');
window.MediaSource = window.MediaSource || window.WebKitMediaSource;
if (!!!window.MediaSource) {
  alert('MediaSource API is not available');
}
var mediaSource = new MediaSource();
video.src = window.URL.createObjectURL(mediaSource);
var reader = new FileReader();

function success(e) {
  var sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp9"');

  console.log('mediaSource readyState: ' + this.readyState);

  var process = function (uInt8Array) {
    var file = new Blob([uInt8Array], {type: 'video/webm'});
    // Reads aren't guaranteed to finish in the same order they're started in,
    // so we need to read + append the next chunk after the previous reader
    // is done (onload is fired).
    reader.onload = function(e) {
        mediaSource.sourceBuffers[0].timestampOffset=isNaN(mediaSource.duration)?0:mediaSource.duration;
        mediaSource.sourceBuffers[0].appendBuffer(new Uint8Array(e.target.result));
        if (video.paused) {
          video.play(); 
          GET("/getwebm/2", process);
        }
    };
    reader.readAsArrayBuffer(file);
    
  }


  GET("/getwebm/1", process);
}

mediaSource.addEventListener('sourceopen', success, false);

function GET(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'arraybuffer';
  xhr.send();

  xhr.onload = function(e) {
    if (xhr.status != 200) {
      alert("Unexpected status code " + xhr.status + " for " + url);
      return false;
    }
    callback(new Uint8Array(xhr.response));
  };
}