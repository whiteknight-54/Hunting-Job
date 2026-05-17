import { isSlackAuthEnforced } from "../../../lib/core/slack-auth-config.js";
import { SESSION_COOKIE, getSessionSecret } from "../../../lib/core/session-cookie.js";
import { verifySessionCached } from "../../../lib/core/verify-session-cached.js";
import { methodNotAllowed } from "../../../lib/core/api-response.js";

function readSessionCookie(req) {
  const raw = req.headers.cookie || "";
  const match = raw.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res);

  if (!isSlackAuthEnforced()) {
    return res.status(200).json({ enabled: false, authenticated: false });
  }

  const secret = getSessionSecret();
  const session = await verifySessionCached(readSessionCookie(req), secret);

  const expectedTeam = (process.env.SLACK_TEAM_ID || "").trim();
  if (!session || (expectedTeam && session.teamId !== expectedTeam)) {
    return res.status(200).json({ enabled: true, authenticated: false });
  }

  return res.status(200).json({
    enabled: true,
    authenticated: true,
    user: {
      id: session.userId,
      name: session.name || null,
      email: session.email || null,
      picture: session.picture || null,
      teamId: session.teamId,
    },
  });
}
