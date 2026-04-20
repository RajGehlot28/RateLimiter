// This is entry point of backend - server.js
const express = require('express');
const rateLimiter = require('./middleware/rateLimiter');
const apiRoutes = require("./routes/apiRoutes");

const app = express();
const PORT = 5000;

// using ejs files
app.set("view engine", "ejs");

// Applying rate limiter to all routes
app.use(rateLimiter);

// routes
app.use("/api", apiRoutes);

app.listen(PORT, () => {
    console.log(`Server is listening on ${PORT}`);
})