const redis = require('redis');
const { REDIS_URL } = require('./rateLimitConfig');

const redisClient = redis.createClient({
    url: REDIS_URL
});

redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});
redisClient.on('connect', () => {
    console.log('Successfully connected to Redis Server');
});

module.exports = redisClient;