var video = document.querySelector('video');
window.MediaSource = window.MediaSource || window.WebKitMediaSource;
if (!!!window.MediaSource) {
  alert('MediaSource API is not available');
}
var mediaSource = new MediaSource();
video.src = window.URL.createObjectURL(mediaSource);
var reader = new FileReader();

function success(e) {
  mediaSource.addSourceBuffer('video/webm; codecs="vp9"');
  console.log('mediaSource readyState: ' + this.readyState);
}

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
        }
    };
    reader.readAsArrayBuffer(file);

}

mediaSource.addEventListener('sourceopen', success, false);

var chunkId = 0;
var lastChunkId = 0;
var delay = 0;
var min_delay = 9000;
var max_delay = 20000;

function getMoreChunks(){
    if (lastChunkId == chunkId){
        delay = delay*2;
        if (delay > max_delay){
            delay = max_delay;
        }
    } else {
        delay = min_delay;
    }
    console.log("GON: "+delay+" "+chunkId+" "+lastChunkId);
    setTimeout(function (){ GET(channel, process) },delay);
    lastChunkId = chunkId;
}

function GET(channel, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', "/getwebm/"+channel+"/"+chunkId, true);
  xhr.responseType = 'arraybuffer';
  xhr.send();

  xhr.onload = function(e) {
    if (xhr.status == 404) {
        getLastId(channel);
    } else if (xhr.status != 200) {
      alert("Unexpected status code " + xhr.status + " for getWebm");
      return false;
    } else {
        chunkId++;
        callback(new Uint8Array(xhr.response));
    }
    getMoreChunks();
    
  };
}

function getLastId(channel){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'getwebm/'+channel+'/last-id', true);
    xhr.responseType = 'text';
    xhr.send();
    xhr.onload = function(e) {
    if (xhr.status != 200){
        alert("Unexpected status code " + xhr.status + " for lastId");
        return false;
    }
    console.log()
    if (parseInt(xhr.response) > parseInt(chunkId)){
         chunkId = xhr.response;
    }
    
    }
}

function getChannelNameFromUrl(url){
  return url.split('?')[1].split('=')[1];
}

var channel = getChannelNameFromUrl(window.location.href);

GET(channel, process);