import { SESSION_COOKIE, clearCookie } from "../../../lib/core/session-cookie.js";
import { cookieSecure } from "../../../lib/core/slack-auth.js";
import { methodNotAllowed } from "../../../lib/core/api-response.js";

export default function handler(req, res) {
  if (req.method !== "POST" && req.method !== "GET") return methodNotAllowed(res);

  const secure = cookieSecure(req);
  res.setHeader("Set-Cookie", clearCookie(SESSION_COOKIE, { secure }));
  return res.status(200).json({ ok: true });
}
