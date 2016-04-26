        var channel = getParameterByName('channel');
        (function (document) {

            document.addEventListener('DOMContentLoaded', function () {

                var settings = {
                    grabRate: 66.7,
                    canvasWidth: 200,
                    canvasHeight: 160,
                    videoSocketClient: 'ws://10.11.8.159:4706/video-client'
                };



                var senderEl = document.getElementById('sender');
                var receiverEl = document.getElementById('receiver');
                var videoEl = document.getElementById('video');

                var senderContext = senderEl.getContext('2d');
                var receiverContext = receiverEl.getContext('2d');

                var receiverDataLength = settings.canvasWidth * settings.canvasHeight * 4;
                var receiverPos = 0;
                var transferRate = Math.round(((1000 / settings.grabRate) * receiverDataLength / 1024), 2);

                var videoClient = new BinaryClient(settings.videoSocketClient + '?channel=' + channel);
                var stream;

                var imageFrame = receiverContext.getImageData(0, 0, settings.canvasWidth, settings.canvasHeight);
                var userMedia = Modernizr.prefixed('getUserMedia', navigator);

                senderEl.width = settings.canvasWidth;
                senderEl.height = settings.canvasHeight;

                receiverEl.width = settings.canvasWidth;
                receiverEl.height = settings.canvasHeight;

                videoEl.width = settings.canvasWidth;
                videoEl.height = settings.canvasHeight;

                if (!userMedia) {
                    // damn, old browser :-(
                    return alert('your browser is not supported');
                }

                document.getElementById('message').innerHTML = 'Sending: ' + transferRate + ' KB / Sec<br />';
                document.getElementById('message').innerHTML += 'Receiving: ' + transferRate + ' KB / Sec';

                videoClient.on('stream', function (s, meta) {
                    console.log(s);
                    console.log(meta);
                        s.on('data', function (data) {

                            // data is from the type 'ArrayBuffer'
                            // we need to build a Uint8Array out of it
                            // to be able to access the actual data
                            var dataArr = new Uint8Array(data);
                            for (var i = 0, len = dataArr.length; i < len; i++) {
                                imageFrame.data[receiverPos] = dataArr[i];
                                receiverPos++;
                                if (receiverPos % receiverDataLength === 0) {
                                    receiverPos = 0;

                                }
                            }
                            receiverContext.putImageData(imageFrame, 0, 0);
                        });
                });
            });

        })(document);


    var context = new AudioContext();
    var soundController = context;


    function playSound(buff) {
        var node = context.createBufferSource()
            , buffer = context.createBuffer(4, 16384, context.sampleRate)
            , data = buffer.getChannelData(0);
        var src = context.createBufferSource();
        src.buffer = context.createBuffer(4, buff.byteLength, context.sampleRate)
        src.connect(context.destination);
        node.buffer = buffer;
        node.loop = false;
        for (var i = 0; i < buff.byteLength; i++) {
                data[i] = buff[i];
        }

        node.connect(context.destination);
        node.start(0);

    }
    var client = BinaryClient('ws://10.11.8.159:4703/audio-client?channel=' + channel);

    client.on('stream', function (stream) {
                  soundController.nextTime = 0;
                  var init = false;
                  var audioCache = [];


                  stream.on('data', function (data) {
                    var array = new Float32Array(data);
                    playSound(array);
                  });

                  stream.on('end', function () {
                    console.log('||| End of Audio Stream');
                  });

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
