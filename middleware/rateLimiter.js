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
        // Execute a pipeline transaction block to guarantee atomic execution 
        // and avoid race conditions across multi-stage network loops.
        
        const pipeline = redisClient.multi();
        
        // Step 1: Evict old timestamp elements older than current window cutoff boundary
        pipeline.zRemRangeByScore(redisKey, '-inf', `(${windowCutoff}`);
        
        // Step 2: Record valid entry stamp value inside user's chronological sorted sequence tracking
        await redisClient.zAdd(redisKey, { score: currentTime, value: String(currentTime) });
        
        // Step 3: Fetch count tracking size of total remaining entries in active window
        pipeline.zCard(redisKey);
        
        const responses = await pipeline.exec();
        const activeRequestsCount = responses[1]; // Result of the zCard command query execution

        if(activeRequestsCount > MAX_LIMIT) {
            // Threshold breach detected -> Throttling block intercepts processing flow
            return res.status(429).render('rateLimitExceed.ejs');
        }

        next();
    } catch(error) {
        console.error("Rate limiter internal processing failure:", error);
        next();
    }
};