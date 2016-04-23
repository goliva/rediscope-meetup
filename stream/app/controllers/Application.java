package controllers;

import java.util.HashMap;
import java.util.Map;

import com.fasterxml.jackson.databind.JsonNode;

import models.Channel;
import play.libs.F.Callback;
import play.libs.F.Callback0;
import play.Logger;
import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Result;
import play.mvc.WebSocket;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPoolConfig;
import services.ChannelReplication;
import services.Program;
import views.html.index;

public class Application extends Controller {

	private static final Map<String,Channel> channels = new HashMap<String,Channel>();
	private static final JedisPool jedisPool = new JedisPool(new JedisPoolConfig(), "localhost");
	
    public static Result index() {
        return ok(index.render("Your new application is ready."));
    }

    public static WebSocket<String> stream(final String username) {
    	final Program listener = new Program(username);
    	listener.start();
    	return new WebSocket<String>() {
            public void onReady(WebSocket.In<String> in, WebSocket.Out<String> out) {
            	final Jedis jedisClient = jedisPool.getResource();
            	in.onMessage(new Callback<String>() {
                    public void invoke(String event) {
                    	jedisClient.publish(username, event);
                    }
                });
                in.onClose(new Callback0() {
                    public void invoke() {
                    	channels.get(username).killChannel();
                        channels.remove(username);
                        jedisPool.returnResource(jedisClient);
                        listener.close();
                    }
                });
                out.write(username+", you are ready to cast!");
                channels.put(username, new Channel());
            }
        };
    }
    
    public static WebSocket<String> broadcast(final String channel) {
    	if (channels.get(channel) == null){
    		return new WebSocket<String>() {
        		public void onReady(WebSocket.In<String> in, final WebSocket.Out<String> out) {
                    out.write("Channel not Found");
                    out.close();
                }
            };
    	}
    	WebSocket<String> clientWS = new WebSocket<String>() {
    		private Integer id = (int)(Math.random()*100);
            public void onReady(WebSocket.In<String> in, final WebSocket.Out<String> out) {
                
            	in.onClose(new Callback0() {
                    public void invoke() {
                        channels.get(channel).removeClient(id);
                    }
                });
            	channels.get(channel).add(id, out);
                out.write("Connected to "+channel+"!");
            }
        };
        return clientWS;
    }
    
    private static Map<String, ChannelReplication> replications = new HashMap<String, ChannelReplication>(); 
    
    public static Result replicate(String username){
    	Logger.error("GONZALOOOO "+request().body().asJson());
    	JsonNode content = request().body().asJson();
    	Logger.error("GONZALOOOO "+content.toString());
    	String sourceHost = content.get("sourceHost").textValue();
    	Integer sourcePort = content.get("sourcePort").asInt();
    	String destinyHost = content.get("destinyHost").textValue();;
    	Integer destinyPort = content.get("destinyPort").asInt();
    	ChannelReplication channelReplication = new ChannelReplication(username, sourceHost, sourcePort, destinyHost, destinyPort);
    	channelReplication.start();
    	replications.put(username, channelReplication);
    	return ok(username+" is replicating");
    }
    
    public static Result finishReplication(String username){
    	replications.get(username).close();
    	replications.remove(username);
    	return ok(username+" is close");
    }
    
    public static Result channels() {
        return ok(Json.parse(channels.keySet().toString()));
    }
    
    public static Channel getChannel(String username){
    	return channels.get(username);
    }
}
