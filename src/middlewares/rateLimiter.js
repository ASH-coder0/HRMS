const requestCounts = new Map();

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 100;

const rateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();

  if (!requestCounts.has(ip)) requestCounts.set(ip, []);

  const timestamps = requestCounts.get(ip).filter((ts) => now - ts < WINDOW_MS);

  if (timestamps.length >= MAX_REQUESTS) {
    return res.status(429).json({ status: false, message: 'Too many requests. Please try again later.' });
  }

  timestamps.push(now);
  requestCounts.set(ip, timestamps);
  next();
};

module.exports = rateLimiter;
