// This middleware will check if MAX_LIMIT per TIME_WINDOW has exceed or not
const {TIME_WINDOW, MAX_LIMIT} = require('../config/rateLimitConfig');
const { getCurrentTimestamp } = require("../services/timestamp");


const userRequest = new Map();

module.exports = (req, res, next) => {
    const userId = req.ip; // assuming device ip as it's id
    const currentTime = getCurrentTimestamp();

    if(!userRequest.has(userId)) { // user haven't sent any request - so initialize deque
        userRequest.set(userId, []);
    }
    const deque = userRequest.get(userId);

    while(deque.length > 0 && currentTime - deque[0] >= TIME_WINDOW) {
        deque.shift();
    }

    if(deque.length >= MAX_LIMIT) { // already have MAX_LIMITS no of request in same window so this request will not accepted
        return res.status(429).render('rateLimitExceed.ejs');
    }
    // adding current time to deque
    deque.push(currentTime);
    
    next();
};