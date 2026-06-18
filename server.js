require('dotenv').config();
const express = require('express');
const redisClient = require('./config/redisClient');
const rateLimiter = require('./middleware/rateLimiter');
const apiRoutes = require("./routes/apiRoutes");

const app = express();
const PORT = process.env.PORT;

app.set("view engine", "ejs");

// nitialize and connect Redis client prior to handling application requests
async function initializeRedis() {
    try {
        await redisClient.connect();
    } catch(error) {
        console.error("Critical: Failed to connect to Redis server during startup:", error);
    }
}
initializeRedis();

// Applying rate limiter middleware to all routes
app.use(rateLimiter);

// Routes
app.use("/api", apiRoutes);

app.listen(PORT, () => {
    console.log(`Server is listening on ${PORT}`);
});