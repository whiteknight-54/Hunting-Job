import { verifySessionToken } from "./session-cookie.js";

const SESSION_VERIFY_TTL_MS = 30_000;
const verified = new Map();

/**
 * Cached HMAC session verify — valid sessions only (30s per warm instance).
 * Reduces CPU when middleware + API both check the same cookie in one navigation.
 */
export async function verifySessionCached(token, secret) {
  if (!token || !secret) return null;

  const now = Date.now();
  const hit = verified.get(token);
  if (hit && hit.expiresAt > now) return hit.session;

  const session = await verifySessionToken(token, secret);
  if (session) {
    verified.set(token, { session, expiresAt: now + SESSION_VERIFY_TTL_MS });
  }
  return session;
}

/** @internal */
export function clearSessionVerifyCache() {
  verified.clear();
}
