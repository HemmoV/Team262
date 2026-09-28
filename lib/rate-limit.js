// Simpele in-memory rate limiter, per IP-adres. Voldoende voor één VPS-instance;
// bij meerdere servers zou dit in een gedeelde store (bv. Redis) moeten staan.
function createRateLimiter({ windowMs, max }) {
  const store = new Map();

  return {
    isLimited(key) {
      const entry = store.get(key);
      if (!entry) return false;
      if (Date.now() - entry.first > windowMs) {
        store.delete(key);
        return false;
      }
      return entry.count >= max;
    },
    registerAttempt(key) {
      const entry = store.get(key);
      if (!entry) {
        store.set(key, { count: 1, first: Date.now() });
      } else {
        entry.count += 1;
      }
    },
  };
}

module.exports = { createRateLimiter };
