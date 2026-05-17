import { requireSlackSession } from "./require-slack-session.js";

/**
 * Returns session payload, `{ authDisabled: true }` when auth is off, or null after 401.
 */
export async function guardApi(req, res) {
  return requireSlackSession(req, res);
}
