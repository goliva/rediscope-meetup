(function(window, document) {
    $("#myonoffswitch").change(function() {
          if(this.checked) {
              $(".ready").hide();
              $(".streaming").fadeIn();
          } else {
              $(".streaming").hide();
              $(".ready").fadeIn();
          }
      });

document.addEventListener('DOMContentLoaded', function () {

    var settings = {
        grabRate: 66.7,
        canvasWidth: 200,
        canvasHeight: 160,
        videoSocketSrv: 'ws://localhost:4705/video-server'
    };

    var channel = getParameterByName('channel');

    var senderEl = document.getElementById('sender');
    var videoEl = document.getElementById('video');

    var senderContext = senderEl.getContext('2d');

    var receiverDataLength = settings.canvasWidth * settings.canvasHeight * 4;
    var receiverPos = 0;
    var transferRate = Math.round(((1000 / settings.grabRate) * receiverDataLength / 1024), 2);

    var videoClient = new BinaryClient(settings.videoSocketSrv);
    var stream;

    var userMedia = Modernizr.prefixed('getUserMedia', navigator);

    senderEl.width = settings.canvasWidth;
    senderEl.height = settings.canvasHeight;

    videoEl.width = settings.canvasWidth;
    videoEl.height = settings.canvasHeight;

    if (!userMedia) {
        console.log('your browser is not supported');
    }

    document.getElementById('message').innerHTML = 'Sending: ' + transferRate + ' KB / Sec<br />';
    document.getElementById('message').innerHTML += 'Receiving: ' + transferRate + ' KB / Sec';

    videoClient.on('open', function (s) {
        console.log("socket open");
        stream = videoClient.createStream(channel);
    });

    // gets called in an certain interval and grabs the current video frame
    // and draws it into a canvas
    var grabLoop = function () {
        try {
            senderContext.drawImage(videoEl, 0, 0, settings.canvasWidth, settings.canvasHeight);
        } catch (e) {}
        var imageData = senderContext.getImageData(0, 0, settings.canvasWidth, settings.canvasHeight);
        if (typeof stream !== 'undefined') {
            stream.write(imageData.data);
        }else{
            console.log("algo paso");
        }
        setTimeout(grabLoop, settings.grabRate);
    };

    // gets called as soon we have access to the camera..

    var gUsuccess = function (stream) {
        videoEl.src = window.URL.createObjectURL(stream);
        videoEl.play();
        console.log('success');
        setTimeout(grabLoop, settings.grabRate);
    };

    var gUfail = function () {
        console.log('no webcam access :-( guachin');
    };

    userMedia({video: true}, gUsuccess, gUfail);
});


function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}


  console.log("START!")
  var client = new BinaryClient('ws://localhost:4702/audio-server');

  client.on('open', function() {
    var channel = getParameterByName('channel');
    window.Stream = client.createStream(channel);

    if (!navigator.getUserMedia)
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia || navigator.msGetUserMedia;

    if (navigator.getUserMedia) {
      navigator.getUserMedia({audio:true}, success, function(e) {
        alert('Error capturing audio.');
      });
    } else alert('getUserMedia not supported in this browser.');

    var recording = false;

    window.startRecording = function() {
      recording = true;
    }

    window.stopRecording = function() {
      recording = false;
      window.Stream.end();
    }

    function success(e) {
      audioContext = window.AudioContext || window.webkitAudioContext;
      context = new audioContext();

      // the sample rate is in context.sampleRate
      audioInput = context.createMediaStreamSource(e);

      var bufferSize = 16384;
      recorder = context.createScriptProcessor(bufferSize, 4, 4);

      recorder.onaudioprocess = function(e){
        if(!recording) return;

        var left = e.inputBuffer.getChannelData(0);
        console.log(left);
        window.Stream.write(left);
      }

      audioInput.connect(recorder)
      recorder.connect(context.destination);
    }

  });
})(this, document);
