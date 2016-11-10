var buffer = []
var video = document.querySelector('video');

video.onended = onVideoEnded;

function onVideoEnded(e) {
    video.src = window.URL.createObjectURL(buffer.shift());
}

function getChannelNameFromUrl(url){
  return url.split('?')[1].split('=')[1];
}

var channel = getChannelNameFromUrl(window.location.href);

function checkBufferAndPlay(){
  console.log("checking...");
  if (buffer.length > 0 && video.src == ""){
    video.src = window.URL.createObjectURL(buffer.shift());
  } else if(video.src == ""){
    setTimeout(checkBufferAndPlay, 1000);
  }

}

setTimeout(checkBufferAndPlay, 1000);