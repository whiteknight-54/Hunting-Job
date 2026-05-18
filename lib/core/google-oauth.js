import { google } from "googleapis";

function envTrim(name) {
  return (process.env[name] || "").trim();
}

/** OAuth user credentials (Drive, Sheets, etc.). */
export function isGoogleOAuthConfigured() {
  return Boolean(
    envTrim("GOOGLE_CLIENT_ID") &&
      envTrim("GOOGLE_CLIENT_SECRET") &&
      envTrim("GOOGLE_REFRESH_TOKEN")
  );
}

export function getGoogleOAuth2Client() {
  const clientId = envTrim("GOOGLE_CLIENT_ID");
  const clientSecret = envTrim("GOOGLE_CLIENT_SECRET");
  const refreshToken = envTrim("GOOGLE_REFRESH_TOKEN");
  const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
  oauth2.setCredentials({ refresh_token: refreshToken });
  return oauth2;
}
