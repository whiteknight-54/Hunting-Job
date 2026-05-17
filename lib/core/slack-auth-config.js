/**
 * Edge-safe Slack auth (no Node `crypto` — safe for middleware).
 *
 * .env.local:
 *   SLACK_CLIENT_ID, SLACK_CLIENT_SECRET, SLACK_TEAM_ID
 *   SLACK_AUTH_REQUIRED=1   (recommended — forces login)
 * Set SLACK_AUTH_REQUIRED=off only to disable protection locally.
 */

export function envTrim(name) {
  return (process.env[name] || "").trim();
}

export function getSlackClientId() {
  return envTrim("SLACK_CLIENT_ID");
}

export function getSlackClientSecret() {
  return envTrim("SLACK_CLIENT_SECRET");
}

export function getSlackTeamId() {
  return envTrim("SLACK_TEAM_ID");
}

/** @alias getSlackTeamId */
export function getExpectedSlackTeamId() {
  return getSlackTeamId();
}

/** All OAuth env vars present (Sign in with Slack can run). */
export function isSlackAuthConfigured() {
  return Boolean(getSlackClientId() && getSlackClientSecret() && getSlackTeamId());
}

/** For debugging / health checks. */
export function getSlackAuthStatus() {
  return {
    enforced: isSlackAuthEnforced(),
    configured: isSlackAuthConfigured(),
    hasClientId: Boolean(getSlackClientId()),
    hasClientSecret: Boolean(getSlackClientSecret()),
    hasTeamId: Boolean(getSlackTeamId()),
  };
}

/**
 * When true, middleware blocks anonymous users.
 * Default: ON if SLACK_CLIENT_ID is set (unless SLACK_AUTH_REQUIRED=off).
 */
export function isSlackAuthEnforced() {
  const flag = envTrim("SLACK_AUTH_REQUIRED").toLowerCase();
  if (flag === "0" || flag === "false" || flag === "off") return false;
  if (flag === "1" || flag === "true" || flag === "on") return true;
  return Boolean(getSlackClientId());
}

/** @deprecated use isSlackAuthConfigured */
export function isSlackAuthEnabled() {
  return isSlackAuthConfigured();
}
