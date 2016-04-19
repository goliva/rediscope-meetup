package models;

import java.util.HashMap;
import java.util.Map;

import play.mvc.WebSocket;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPoolConfig;
import services.Subscriber;

public class Channel {

	private static final Map<Integer,WebSocket.Out<String>> clients = new HashMap<Integer,WebSocket.Out<String>>();

	public void notifyAll(String event){
		for (WebSocket.Out<String> clientWebSocket : clients.values()) {
    		clientWebSocket.write(event);
		}
	}
	
	public void add(Integer id, WebSocket.Out<String> out){
		clients.put(id, out);
	}
	
	public void removeClient(Integer id){
		clients.remove(id);
	}
	
	public void killChannel(){
		for (WebSocket.Out<String> clientWebSocket : clients.values()) {
			clientWebSocket.write("Host stop streaming");
			clientWebSocket.close();
		}
	}
}
