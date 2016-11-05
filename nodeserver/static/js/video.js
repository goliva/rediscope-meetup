var video = document.querySelector('video');
window.MediaSource = window.MediaSource || window.WebKitMediaSource;
if (!!!window.MediaSource) {
  alert('MediaSource API is not available');
}
var mediaSource = new MediaSource();
video.src = window.URL.createObjectURL(mediaSource);
var reader = new FileReader();
var first = true;
function success(e) {
  var sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp9"');

  console.log('mediaSource readyState: ' + this.readyState);

  var process = function (uInt8Array) {
    var file = new Blob([uInt8Array], {type: 'video/webm'});
    var duration = 0;

    

      // Reads aren't guaranteed to finish in the same order they're started in,
      // so we need to read + append the next chunk after the previous reader
      // is done (onload is fired).
      reader.onload = function(e) {
        console.log("Gon "+duration);
        if (first){
            mediaSource.sourceBuffers[0].timestampOffset=0;
            first = false;
        }else{
            mediaSource.sourceBuffers[0].timestampOffset=10;
        }
        
        mediaSource.sourceBuffers[0].appendBuffer(new Uint8Array(e.target.result));
        console.log(mediaSource.duration);
        duration = mediaSource.duration;

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