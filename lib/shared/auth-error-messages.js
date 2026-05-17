export const AUTH_ERROR_MESSAGES = {
  wrong_team: "Your Slack workspace is not allowed for this app.",
  invalid_state: "Sign-in expired. Please try again.",
  sign_in_failed: "Slack sign-in failed. Please try again.",
  not_configured: "Slack sign-in is not configured on the server.",
};

export function messageForAuthError(code) {
  const key = String(code || "").trim();
  return AUTH_ERROR_MESSAGES[key] || "Sign-in was cancelled or failed.";
}
