require('dotenv').config();
const express = require('express');
const redisClient = require('./config/redisClient');
const rateLimiter = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT;

app.set("view engine", "ejs");

// initialize and connect Redis client prior to handling application requests
async function initializeRedis() {
    try {
        await redisClient.connect();
    } catch(error) {
        console.error("Critical: Failed to connect to Redis server during startup:", error);
    }
}
initializeRedis();

app.get("/api/protected", rateLimiter, (req, res) => {
    return res.status(200).render('success.ejs');
});

app.listen(PORT, () => {
    console.log(`Server is listening on ${PORT}`);
});