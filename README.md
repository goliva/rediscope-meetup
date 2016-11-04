Playframework 2.2.6 

Redis 3.0.6 port 6379

To stream go to:

http://www.websocket.org/echo.html

Host to: ws://localhost:9000/stream/hello

Client to ws://localhost:9000/broadcast/hello


Enjoy!


#REPLICATION


Start replication:
curl -H "Content-Type: application/json" -X POST -d '{"sourceHost":"ip", "sourcePort":port, "destinyHost":"ip", "destinyPort":port}' http://localhost:9000/replicate/start/:topic

Example:
curl -H "Content-Type: application/json" -X POST -d '{"sourceHost":"localhost", "sourcePort":6379, "destinyHost":"localhost", "destinyPort":6378}' http://localhost:9000/replicate/start/golza


Stop replication:
curl  http://localhost:9000/replicate/kill/:topic

Excample:
curl  http://localhost:9000/replicate/kill/golza


Play 2.2.6

#FFMPEG

ffmpeg -framerate 1 -pattern_type glob -i "content_147827212/*.jpeg" -s 320x240 video2.webm

video codec: vp9
