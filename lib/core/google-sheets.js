import { google } from "googleapis";
import { getGoogleOAuth2Client, isGoogleOAuthConfigured } from "./google-oauth.js";

function envTrim(name) {
  return (process.env[name] || "").trim();
}

export const TAILOR_APP_SHEET_TAB = "TailorApp";

/** True when GOOGLE_SHEET_ID + Google OAuth env vars are set. */
export function isGoogleSheetLogConfigured() {
  return Boolean(isGoogleOAuthConfigured() && envTrim("GOOGLE_SHEET_ID"));
}

/**
 * Date for column A — mm/dd in GOOGLE_SHEET_TIMEZONE (default Asia/Tokyo, UTC+9).
 * @param {Date} [date]
 */
export function formatTailorAppSheetDate(date = new Date()) {
  const timeZone = envTrim("GOOGLE_SHEET_TIMEZONE") || "Asia/Tokyo";
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const mm = parts.find((p) => p.type === "month")?.value ?? "";
  const dd = parts.find((p) => p.type === "day")?.value ?? "";
  // Plain text mm/dd — must be sent with valueInputOption RAW (USER_ENTERED → serial ~46160).
  return `${mm}/${dd}`;
}

/**
 * @returns {[string, string, string, string]} Date, Bidder, FileName, link
 */
export function buildTailorAppSheetRow({ date, userName, fileName, driveLink }) {
  return [
    date ?? formatTailorAppSheetDate(),
    String(userName || "").trim() || "User",
    String(fileName || "").trim(),
    String(driveLink || "").trim(),
  ];
}

/** Drive web view link when upload succeeded. */
export function driveLinkFromUpload(driveUpload) {
  if (driveUpload?.ok && driveUpload.webViewLink) {
    return String(driveUpload.webViewLink).trim();
  }
  return "";
}

/**
 * Append one row to the TailorApp tab (columns A–D).
 * @param {[string, string, string, string]} row
 */
export async function appendTailorAppSheetRow(row) {
  const spreadsheetId = envTrim("GOOGLE_SHEET_ID");
  if (!spreadsheetId) {
    return { ok: false, skipped: true };
  }
  if (!isGoogleOAuthConfigured()) {
    return { ok: false, skipped: true };
  }

  try {
    const auth = getGoogleOAuth2Client();
    const sheets = google.sheets({ version: "v4", auth });
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${TAILOR_APP_SHEET_TAB}!A:D`,
      // RAW keeps mm/dd as text; USER_ENTERED parses "05/17" → date serial ~46160 in column A.
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [row] },
    });
    return { ok: true };
  } catch (err) {
    const message = err?.message || String(err);
    console.error("[google-sheets] append TailorApp row:", message);
    return { ok: false, error: message };
  }
}
