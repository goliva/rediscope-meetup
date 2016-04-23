Playframework 2.2.6 

Redis 3.0.6 port 6379

To stream go to:

http://www.websocket.org/echo.html

Host to: ws://localhost:9000/stream/hello

Client to ws://localhost:9000/broadcast/hello


Enjoy!


##REPLICATION##

example to start replication:
curl -H "Content-Type: application/json" -X POST -d '{"sourceHost":"localhost", "sourcePort":6379, "destinyHost":"localhost", "destinyPort":6378}' http://localhost:9000/replicate/start/golza


example to stop replication:
curl  http://localhost:9000/replicate/kill/golza


Play 2.2.6


