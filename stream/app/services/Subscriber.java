package services;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import controllers.Application;
import redis.clients.jedis.JedisPubSub;

public class Subscriber extends JedisPubSub {

    @Override
    public void onMessage(String channel, String message) {
        Application.getChannel(channel).notifyAll(message);
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