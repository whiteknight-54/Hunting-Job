import { isSlackAuthConfigured } from "../../../lib/core/slack-auth-config.js";
import {
  OAUTH_RETURN_COOKIE,
  OAUTH_STATE_COOKIE,
  assertSlackTeam,
  buildAuthErrorRedirect,
  cookieSecure,
  exchangeSlackCode,
  getRedirectUri,
  getSlackAuthConfig,
  parseIdToken,
  sanitizeReturnPath,
} from "../../../lib/core/slack-auth.js";
import {
  SESSION_COOKIE,
  clearCookie,
  getSessionSecret,
  serializeCookie,
  signSessionToken,
} from "../../../lib/core/session-cookie.js";
import { methodNotAllowed } from "../../../lib/core/api-response.js";

function readCookie(req, name) {
  const raw = req.headers.cookie || "";
  const match = raw.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res);

  const secure = cookieSecure(req);
  const clearOAuth = [
    clearCookie(OAUTH_STATE_COOKIE, { secure }),
    clearCookie(OAUTH_RETURN_COOKIE, { secure }),
  ];

  const returnTo = sanitizeReturnPath(readCookie(req, OAUTH_RETURN_COOKIE) || "/");

  if (!isSlackAuthConfigured()) {
    res.setHeader("Set-Cookie", clearOAuth);
    return res.redirect(302, buildAuthErrorRedirect(returnTo, "not_configured"));
  }

  const slackError = req.query.error;
  if (slackError) {
    res.setHeader("Set-Cookie", clearOAuth);
    return res.redirect(302, buildAuthErrorRedirect(returnTo, String(slackError)));
  }

  const code = String(req.query.code || "");
  const state = String(req.query.state || "");
  const savedState = readCookie(req, OAUTH_STATE_COOKIE);

  if (!code || !state || state !== savedState) {
    res.setHeader("Set-Cookie", clearOAuth);
    return res.redirect(302, buildAuthErrorRedirect(returnTo, "invalid_state"));
  }

  try {
    const { clientId, clientSecret, teamId } = getSlackAuthConfig();
    const redirectUri = getRedirectUri(req);
    const tokenData = await exchangeSlackCode({ clientId, clientSecret, code, redirectUri });
    const user = parseIdToken(tokenData.id_token);
    assertSlackTeam(user.teamId, teamId);

    const secret = getSessionSecret();
    if (!secret) throw new Error("missing_session_secret");

    const { token, maxAge } = await signSessionToken(
      {
        userId: user.userId,
        teamId: user.teamId,
        name: user.name,
        email: user.email,
        picture: user.picture,
      },
      secret
    );

    res.setHeader("Set-Cookie", [
      serializeCookie(SESSION_COOKIE, token, { maxAge, secure }),
      ...clearOAuth,
    ]);
    return res.redirect(302, returnTo);
  } catch (err) {
    const codeName = err?.message === "wrong_team" ? "wrong_team" : "sign_in_failed";
    console.error("[slack-auth] callback:", err?.message || err);
    res.setHeader("Set-Cookie", clearOAuth);
    return res.redirect(302, buildAuthErrorRedirect(returnTo, codeName));
  }
}
