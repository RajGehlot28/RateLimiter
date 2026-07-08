const { TIME_WINDOW, MAX_LIMIT } = require('../config/rateLimitConfig');
const { getCurrentTimestamp } = require("../services/timestamp");
const redisClient = require('../config/redisClient');

module.exports = async (req, res, next) => {
    const userId = req.ip; // Identify user by unique request device IP address
    const currentTime = getCurrentTimestamp();
    
    // Define the lower sliding window cutoff timestamp bound
    const windowCutoff = currentTime - TIME_WINDOW;
    const redisKey = `rate_limit:${userId}`;

    try {
        // to calculate performance time
        const start = performance.now();

        // created a pipeline in which commands will stored in queue and run one by one
        const pipeline = await redisClient.multi();

        // ZSET is a sorted set of redis

        // removing requests older than windowCutOff from ZSET - (start from -inf to windowCutOff)
        pipeline.zRemRangeByScore(redisKey, '-inf', `(${windowCutoff}`);
        
        // adding current request time-stamp to ZSET
        pipeline.zAdd(redisKey, { score: currentTime, value: String(currentTime) });
        
        // counting number of requests in current active window
        pipeline.zCard(redisKey);
        
        // sending and executing all three above commands of pipeline on redis server
        const responses = await pipeline.exec(); // return array of results for all commands
        const activeRequestsCount = responses[2]; // count is stored at second index of responses

        // calculating performance time
        const end = performance.now();
        console.log(`Middleware latency: ${end - start} ms`);

        const remaining = Math.max(0, MAX_LIMIT - activeRequestsCount);

        // finding 1st request in current window -> from index 0 to 0
        const oldestRequests = await redisClient.zRangeWithScores(redisKey, 0, 0);
        const oldestTimestamp = oldestRequests[0].score;
        const windowClearTime = oldestTimestamp + TIME_WINDOW; // time when window will be clear -> can send more request
        // calculating time left to window reset
        const resetTime = Math.ceil((windowClearTime - currentTime) / 1000);

        // setting response headers
        res.setHeader('RateLimit', MAX_LIMIT);
        res.setHeader('Request-Remaining', remaining);

        if(activeRequestsCount > MAX_LIMIT) {
            // if user exceed limit then render rateLimitExceed page
            res.setHeader('Retry-After', resetTime);
            return res.status(429).render('rateLimitExceed.ejs');
        }
        next(); // if everything ok then sending user's request to next middleware or route controller

    } catch(error) {
        // Rate limiter processing failure
        return res.status(500).json({
            success: false,
            message: "We are currently unable to process your request. Please try again shortly."
        });
    }
};