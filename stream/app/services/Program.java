package services;


import play.Logger;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPoolConfig;

public class Program extends Thread{

	private final String CHANNEL_NAME;
	final JedisPoolConfig poolConfig = new JedisPoolConfig();
    final JedisPool jedisPool = new JedisPool(poolConfig, "localhost", 6379, 0);
    final Jedis subscriberJedis = jedisPool.getResource();
    final Subscriber subscriber = new Subscriber();
  

    public Program(String username){
    	CHANNEL_NAME = username;
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
	    jedisPool.returnResource(subscriberJedis);
	    this.close();
		
	}
}