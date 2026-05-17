import { randomBytes } from "crypto";
import {
  getExpectedSlackTeamId,
  getSlackClientId,
  getSlackClientSecret,
  getSlackTeamId,
  isSlackAuthConfigured,
  isSlackAuthEnabled,
  isSlackAuthEnforced,
  getSlackAuthStatus,
} from "./slack-auth-config.js";

export {
  isSlackAuthConfigured,
  isSlackAuthEnabled,
  isSlackAuthEnforced,
  getSlackAuthStatus,
  getExpectedSlackTeamId,
  getSlackClientId,
  getSlackClientSecret,
  getSlackTeamId,
};

const SLACK_OPENID_AUTHORIZE = "https://slack.com/openid/connect/authorize";
const SLACK_OPENID_TOKEN = "https://slack.com/api/openid.connect.token";

export const OAUTH_STATE_COOKIE = "hj_oauth_state";
export const OAUTH_RETURN_COOKIE = "hj_oauth_return";
/** Must match Slack app redirect URL and `pages/api/auth/slack-callback.js`. */
export const SLACK_CALLBACK_PATH = "/api/auth/slack-callback";

function envTrim(name) {
  return (process.env[name] || "").trim();
}

export function getSlackAuthConfig() {
  return {
    clientId: getSlackClientId(),
    clientSecret: getSlackClientSecret(),
    teamId: getExpectedSlackTeamId(),
  };
}

export function randomOAuthState() {
  return randomBytes(24).toString("hex");
}

/** Normalize `returnTo` query (string or array from Next.js). */
export function parseReturnToQuery(queryValue) {
  const raw = Array.isArray(queryValue) ? queryValue[0] : queryValue;
  return sanitizeReturnPath(raw);
}

/** Safe internal redirect only (no open redirect). */
export function sanitizeReturnPath(raw) {
  let value = String(raw || "/").trim();
  try {
    if (value.includes("%")) value = decodeURIComponent(value);
  } catch {
    return "/";
  }
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  if (value.includes("\\") || /^https?:/i.test(value)) return "/";
  return value;
}

/** Redirect target after failed sign-in (keeps deep links like /manual/jf). */
export function buildAuthErrorRedirect(returnPath, errorCode) {
  const base = sanitizeReturnPath(returnPath);
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}auth_error=${encodeURIComponent(errorCode)}`;
}

export function getRedirectUri(req) {
  const configured = envTrim("SLACK_REDIRECT_URI");
  if (configured) return configured;
  const host = (req.headers["x-forwarded-host"] || req.headers.host || "").split(",")[0].trim();
  const proto = (req.headers["x-forwarded-proto"] || "http").split(",")[0].trim();
  if (!host) return "";
  return `${proto}://${host}${SLACK_CALLBACK_PATH}`;
}

export function buildSlackAuthorizeUrl({ clientId, redirectUri, state }) {
  const params = new URLSearchParams({
    client_id: clientId,
    scope: "openid profile email",
    response_type: "code",
    redirect_uri: redirectUri,
    state,
  });
  return `${SLACK_OPENID_AUTHORIZE}?${params.toString()}`;
}

export function parseIdToken(idToken) {
  const parts = String(idToken || "").split(".");
  if (parts.length !== 3) throw new Error("Invalid Slack id_token");
  const payload = JSON.parse(
    Buffer.from(parts[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8")
  );
  return {
    userId: payload.sub,
    teamId: payload["https://slack.com/team_id"] || payload.team_id,
    name: payload.name || payload["https://slack.com/user_name"] || "",
    email: payload.email || "",
    picture: payload.picture || "",
  };
}

export async function exchangeSlackCode({ clientId, clientSecret, code, redirectUri }) {
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: redirectUri,
  });

  const res = await fetch(SLACK_OPENID_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const data = await res.json();
  if (!data?.ok) {
    const err = data?.error || `HTTP ${res.status}`;
    throw new Error(`Slack token exchange failed: ${err}`);
  }
  if (!data.id_token) throw new Error("Slack did not return id_token");
  return data;
}

export function assertSlackTeam(userTeamId, expectedTeamId) {
  if (userTeamId !== expectedTeamId) {
    throw new Error("wrong_team");
  }
}

export function cookieSecure(req) {
  if (process.env.NODE_ENV === "production") return true;
  const proto = (req.headers["x-forwarded-proto"] || "").split(",")[0].trim();
  return proto === "https";
}
