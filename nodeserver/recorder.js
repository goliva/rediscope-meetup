function Audio (window) {
  console.log("START!")
  var client = new BinaryClient('ws://localhost:4702/audio-server');

  this.init = function() {
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

    function success(e) {
      audioContext = window.AudioContext || window.webkitAudioContext;
      context = new audioContext();

      // the sample rate is in context.sampleRate
      audioInput = context.createMediaStreamSource(e);

      var bufferSize = 16384;
      recorder = context.createScriptProcessor(bufferSize, 4, 4);

      recorder.onaudioprocess = function(e){
        var left = e.inputBuffer.getChannelData(0);
        window.Stream.write(left);
      }

      audioInput.connect(recorder)
      recorder.connect(context.destination); 
    }

  };

  this.stop = function() {
    alert("apagandooo");
    window.Stream.end();
  };
};
