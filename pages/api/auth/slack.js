import { isSlackAuthConfigured } from "../../../lib/core/slack-auth-config.js";
import {
  OAUTH_RETURN_COOKIE,
  OAUTH_STATE_COOKIE,
  buildSlackAuthorizeUrl,
  cookieSecure,
  getRedirectUri,
  getSlackAuthConfig,
  randomOAuthState,
  parseReturnToQuery,
} from "../../../lib/core/slack-auth.js";
import { serializeCookie } from "../../../lib/core/session-cookie.js";
import { methodNotAllowed } from "../../../lib/core/api-response.js";

export default function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res);

  if (!isSlackAuthConfigured()) {
    return res.status(503).json({
      error: "Slack sign-in is not configured",
      message: "Set SLACK_CLIENT_ID, SLACK_CLIENT_SECRET, and SLACK_TEAM_ID in .env.local",
    });
  }

  const { clientId } = getSlackAuthConfig();
  const redirectUri = getRedirectUri(req);
  if (!redirectUri) {
    return res.status(500).json({ error: "Could not determine redirect URI" });
  }

  const state = randomOAuthState();
  const returnTo = parseReturnToQuery(req.query.returnTo);
  const secure = cookieSecure(req);

  res.setHeader("Set-Cookie", [
    serializeCookie(OAUTH_STATE_COOKIE, state, { maxAge: 600, secure }),
    serializeCookie(OAUTH_RETURN_COOKIE, returnTo, { maxAge: 600, secure }),
  ]);

  const url = buildSlackAuthorizeUrl({ clientId, redirectUri, state });
  return res.redirect(302, url);
}
