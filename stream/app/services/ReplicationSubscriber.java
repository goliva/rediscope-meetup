package services;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import controllers.Application;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPubSub;

public class ReplicationSubscriber extends JedisPubSub {

	final Jedis publisher;
	
    public ReplicationSubscriber(Jedis publisherJedis) {
    	super();
    	this.publisher = publisherJedis;
	}

	@Override
    public void onMessage(String channel, String message) {
        publisher.publish(channel, message);
    }

    @Override
    public void onPMessage(String pattern, String channel, String message) {

    }

    @Override
    public void onSubscribe(String channel, int subscribedChannels) {

    }

    @Override
    public void onUnsubscribe(String channel, int subscribedChannels) {

    }

    @Override
    public void onPUnsubscribe(String pattern, int subscribedChannels) {

    }

    @Override
    public void onPSubscribe(String pattern, int subscribedChannels) {

    }
}