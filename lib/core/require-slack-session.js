import { getSlackTeamId, isSlackAuthEnforced } from "./slack-auth-config.js";
import { SESSION_COOKIE, getSessionSecret } from "./session-cookie.js";
import { verifySessionCached } from "./verify-session-cached.js";

function readSessionCookie(req) {
  const raw = req.headers.cookie || "";
  const match = raw.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

/** Returns session user payload or sends 401 and returns null. */
export async function requireSlackSession(req, res) {
  if (!isSlackAuthEnforced()) return { authDisabled: true };

  const secret = getSessionSecret();
  const session = await verifySessionCached(readSessionCookie(req), secret);
  const expectedTeam = getSlackTeamId();
  if (!session || session.teamId !== expectedTeam) {
    res.status(401).json({ error: "Unauthorized", message: "Slack sign-in required for your workspace" });
    return null;
  }
  return session;
}
