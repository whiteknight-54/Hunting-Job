import {
  appendTailorAppSheetRow,
  buildTailorAppSheetRow,
  driveLinkFromUpload,
  isGoogleSheetLogConfigured,
} from "../core/google-sheets.js";

/**
 * Append Date, Bidder, FileName, link to the TailorApp sheet tab (fire-and-forget from API routes).
 * Runs after Drive upload; does not block the PDF response.
 *
 * @param {string} [userName] — Slack display name
 * @param {object} [driveUpload] — result from uploadGeneratedPdfToDrive
 */
export async function logPdfToTailorAppSheet({ fileName, driveUpload, userName }) {
  if (!isGoogleSheetLogConfigured()) return;

  const row = buildTailorAppSheetRow({
    userName,
    fileName,
    driveLink: driveLinkFromUpload(driveUpload),
  });

  try {
    await appendTailorAppSheetRow(row);
  } catch (e) {
    console.error("[tailor-app-sheet]", e?.message || e);
  }
}
