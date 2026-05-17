/** Signed session cookie (Edge + Node via Web Crypto). */

export const SESSION_COOKIE = "hj_session";
const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7;

function encoder() {
  return new TextEncoder();
}

function base64UrlEncode(bytes) {
  let binary = "";
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i++) binary += String.fromCharCode(arr[i]);
  const b64 = typeof btoa !== "undefined" ? btoa(binary) : Buffer.from(arr).toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecodeToString(str) {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? padded : padded + "=".repeat(4 - (padded.length % 4));
  if (typeof atob !== "undefined") {
    return decodeURIComponent(
      Array.from(atob(pad), (c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`).join("")
    );
  }
  return Buffer.from(pad, "base64").toString("utf8");
}

async function hmacSign(message, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder().encode(message));
  return base64UrlEncode(new Uint8Array(sig));
}

function timingSafeEqualStr(a, b) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

export function getSessionSecret() {
  return (
    (process.env.SLACK_SESSION_SECRET || "").trim() ||
    (process.env.SLACK_CLIENT_SECRET || "").trim() ||
    ""
  );
}

/** @param {{ userId: string, teamId: string, name?: string, email?: string }} payload */
export async function signSessionToken(payload, secret) {
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SEC;
  const body = { ...payload, exp };
  const data = base64UrlEncode(encoder().encode(JSON.stringify(body)));
  const sig = await hmacSign(data, secret);
  return { token: `${data}.${sig}`, maxAge: SESSION_MAX_AGE_SEC };
}

export async function verifySessionToken(token, secret) {
  if (!token || !secret) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const data = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = await hmacSign(data, secret);
  if (!timingSafeEqualStr(sig, expected)) return null;
  try {
    const body = JSON.parse(base64UrlDecodeToString(data));
    if (!body?.userId || !body?.teamId) return null;
    if (typeof body.exp !== "number" || body.exp < Math.floor(Date.now() / 1000)) return null;
    return body;
  } catch {
    return null;
  }
}

export function serializeCookie(name, value, { maxAge, httpOnly = true, secure, path = "/", sameSite = "Lax" } = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`, `Path=${path}`, `SameSite=${sameSite}`];
  if (maxAge != null) parts.push(`Max-Age=${maxAge}`);
  if (httpOnly) parts.push("HttpOnly");
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function clearCookie(name, { secure, path = "/" } = {}) {
  return serializeCookie(name, "", { maxAge: 0, httpOnly: true, secure, path });
}
