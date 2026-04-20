# Rate Limiter (Sliding Window)

A backend project I built to simulate and control API traffic using a **Sliding Window Rate Limiting algorithm**.

## What It Does

The system restricts the number of requests a user can make within a fixed time window.

* Each user is allowed a maximum of **K requests per time window**
* If the limit is exceeded, the request is blocked with a **429 - Too Many Requests** response
* Uses an optimized **deque-based sliding window** approach to efficiently track requests

This helps in:

* Preventing API abuse
* Controlling traffic
* Protecting backend services

## Features

* Sliding Window Rate Limiting
* Deque-based optimization (O(1) amortized time)
* Middleware-based request handling
* Retry-After header support
* Clean route structure (`/api/protected`)
* Success and error UI pages (EJS)

## Tech Stack

* **Backend:** Node.js, Express.js
* **Templating:** EJS
* **Data Structures:** JavaScript Map, Queue (Deque simulation)

## How It Works

* Each user is identified using their IP address
* A queue (deque) stores timestamps of recent requests
* Expired timestamps are removed dynamically
* If active requests exceed the limit → request is rejected

## How to Run

```bash
npm install
node server.js
```

Open in browser:

```
http://localhost:5000/api/protected
```

* First few requests → Allowed ✅
* Exceed limit → Blocked 🚫

## Key Learnings

* Implemented sliding window rate limiting
* Optimized request tracking using deque
* Understood middleware flow in Express
* Learned how to handle edge cases like duplicate responses

## Future Improvements

* Use Redis for distributed rate limiting
* Support API key / user-based limits
* Add monitoring dashboard
