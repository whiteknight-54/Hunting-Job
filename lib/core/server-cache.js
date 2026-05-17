/**
 * Process-local cache for warm Vercel lambdas — cuts repeated disk I/O and crypto per user.
 * Not shared across instances; safe for read-mostly deploy artifacts (profiles, prompts).
 */

const entries = new Map();
const inflight = new Map();

/**
 * @template T
 * @param {string} key
 * @param {number} ttlMs
 * @param {() => Promise<T>} loader
 * @returns {Promise<T>}
 */
export async function memoAsync(key, ttlMs, loader) {
  const now = Date.now();
  const hit = entries.get(key);
  if (hit && hit.expiresAt > now) return hit.value;

  if (inflight.has(key)) return inflight.get(key);

  const promise = Promise.resolve()
    .then(loader)
    .then((value) => {
      entries.set(key, { value, expiresAt: Date.now() + ttlMs });
      inflight.delete(key);
      return value;
    })
    .catch((err) => {
      inflight.delete(key);
      throw err;
    });

  inflight.set(key, promise);
  return promise;
}

/** Drop cached value (tests or rare invalidation). */
export function clearMemo(key) {
  entries.delete(key);
  inflight.delete(key);
}

export function clearAllMemo() {
  entries.clear();
  inflight.clear();
}
