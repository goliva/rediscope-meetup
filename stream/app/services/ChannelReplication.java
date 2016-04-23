package services;


import play.Logger;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPoolConfig;

public class ChannelReplication extends Thread{

	private final String CHANNEL_NAME;
	final JedisPoolConfig poolConfig = new JedisPoolConfig();
    final JedisPool jedisPoolFrom;
    final JedisPool jedisPoolTo;
    final Jedis publisherJedis;
    final Jedis subscriberJedis;
    final ReplicationSubscriber subscriber;

    public ChannelReplication(String username, String sourceHost, Integer sourcePort, String destinyHost, Integer destinyPort){
    	CHANNEL_NAME = username;
    	jedisPoolFrom = new JedisPool(poolConfig, sourceHost, sourcePort, 0);
        jedisPoolTo = new JedisPool(poolConfig, destinyHost, destinyPort, 0);
        publisherJedis = jedisPoolTo.getResource();
        subscriberJedis = jedisPoolFrom.getResource();
        subscriber = new ReplicationSubscriber(publisherJedis);

    }


	@Override
	public void run() {
        
		try {
            subscriberJedis.subscribe(subscriber, CHANNEL_NAME);
        } catch (Exception e) {
            Logger.error("Subscribing failed.", e);
        }
		
	}


	public void close() {
		subscriber.unsubscribe();
		this.close();
		
	}
}