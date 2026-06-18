module.exports = {
    TIME_WINDOW : 60 * 1000, // 60 seconds (in milliseconds)
    MAX_LIMIT : 5,           // maximum requests per TIME_WINDOW
    REDIS_URL: process.env.REDIS_URL // Default local Redis fallback URL
};