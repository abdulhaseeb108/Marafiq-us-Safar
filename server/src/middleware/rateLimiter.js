const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 120;
const RATE_LIMIT_MAX_IPS = 10_000;
const rateLimitByIp = new Map();
let rateLimitChecks = 0;

export default function rateLimiter(req, res, next) {
  const now = Date.now();
  if (++rateLimitChecks % 100 === 0) {
    for (const [ip, entry] of rateLimitByIp) {
      if (entry.resetAt <= now) rateLimitByIp.delete(ip);
    }
  }

  const ip = req.ip || req.socket.remoteAddress || "unknown";
  let entry = rateLimitByIp.get(ip);
  if (!entry || entry.resetAt <= now) {
    if (!entry && rateLimitByIp.size >= RATE_LIMIT_MAX_IPS) {
      return res.status(503).json({ error: "The request limiter is busy. Please try again shortly." });
    }
    entry = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
    rateLimitByIp.set(ip, entry);
  }

  res.setHeader("RateLimit-Limit", RATE_LIMIT_MAX);
  res.setHeader("RateLimit-Remaining", Math.max(0, RATE_LIMIT_MAX - entry.count - 1));
  res.setHeader("RateLimit-Reset", Math.ceil(entry.resetAt / 1000));
  if (entry.count >= RATE_LIMIT_MAX) {
    res.setHeader("Retry-After", Math.ceil((entry.resetAt - now) / 1000));
    return res.status(429).json({ error: "Too many requests. Please wait a moment and try again." });
  }

  entry.count += 1;
  return next();
}
