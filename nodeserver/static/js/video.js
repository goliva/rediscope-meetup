var channelName = getParameterByName('channel');
var canvas = document.getElementById('receiver');
canvas.width = 640;
canvas.height = 480;
var canvasContext = canvas.getContext('2d');
var imageFrame = canvasContext.getImageData(0, 0, canvas.width, canvas.height);
var receiverPos = 0;
var receiverDataLength = canvas.width * canvas.height * 4;
var buffer = [];
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

var lastTimeRender = 0;

function render(){
    if (buffer.length>1 && new Date().getTime()-lastTimeRender>1000){
        lastTimeRender = new Date().getTime();
        var data = buffer.shift();
        var dataArr = new Uint8Array(data);
        var len = dataArr.length;
        var times = receiverDataLength/len;
        for (var i = 0; i < len; i++) {
            for (var j=0; j<times; j++){
                imageFrame.data[receiverPos++] = dataArr[i];    
                if (receiverPos % receiverDataLength === 0) {
                    receiverPos = 0;
                }
            }
            
        }
        canvasContext.putImageData(imageFrame, 0, 0);
    }else{
        console.log("buffering..."+buffer.length);
    }
    
}

function getChannelDefinition(){
    var def = 10;
    switch (true) {
        case (buffer.length < 10 && buffer.length > 5):
            def =  9;
            break;
        case (buffer.length < 5 && buffer.length > 4):
            def =  8;
            break;
        case (buffer.length < 4 && buffer.length > 2):
            def =  7;
            break;
        case (buffer.length < 2 &&buffer.length > -1):
            def =  6;
            break;
    };
    return def;

}

function load(){
    var channelDefinition = getChannelDefinition();
    $.ajax({
      url: "/getframe/"+channelName+channelDefinition
    }).done(function(data) {
      buffer.push(JSON.parse(data).data);
    });
}

function loop(){
    if (buffer.length > 5){
        render();
    };
    if (buffer.length<20){
        load();
    }
}

setInterval(function(){ loop(); }, 500);
