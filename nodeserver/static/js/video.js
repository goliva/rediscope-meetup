var channelName = getParameterByName('channel');
var canvas = document.getElementById('receiver');
canvas.width = 640;
canvas.height = 480;
var canvasContext = canvas.getContext('2d');
var imageFrame = canvasContext.getImageData(0, 0, canvas.width, canvas.height);
var receiverPos = 0;
var receiverDataLength = canvas.width * canvas.height * 4;
/*var videoClient = new BinaryClient('ws://localhost:4706/video-client?channel='+channelName);
videoClient.on('stream', function (s, meta) {
    s.on('data', function (data) {
        //console.debug(data);
        var dataArr = new Uint8Array(data);
        for (var i = 0, len = dataArr.length; i < len; i++) {
            imageFrame.data[receiverPos] = dataArr[i];
            receiverPos++;
            if (receiverPos % (receiverDataLength/8) === 0) {
                receiverPos = 0;
            }
        }
        canvasContext.putImageData(imageFrame, 0, 0);

    });
});*/

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function render(data){
    var dataArr = new Uint8Array(data);
    for (var i = 0, len = dataArr.length; i < len; i++) {
        imageFrame.data[receiverPos] = dataArr[i];
        receiverPos++;
        if (receiverPos % (receiverDataLength/8) === 0) {
            receiverPos = 0;
        }
    }
    canvasContext.putImageData(imageFrame, 0, 0);
}

setInterval(function(){  
    $.ajax({
      url: "/getframe"
    }).done(function(data) {
      render(JSON.parse(data).data);
    });
  }, 1000);