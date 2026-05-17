import { Readable } from "stream";
import { google } from "googleapis";

function envTrim(name) {
  return (process.env[name] || "").trim();
}

/** True when GDRIVE_FOLDER_ID + OAuth client credentials are all set. */
export function isGoogleDriveUploadConfigured() {
  return Boolean(
    envTrim("GDRIVE_FOLDER_ID") &&
      envTrim("GOOGLE_CLIENT_ID") &&
      envTrim("GOOGLE_CLIENT_SECRET") &&
      envTrim("GOOGLE_REFRESH_TOKEN")
  );
}

function getOAuth2Client() {
  const clientId = envTrim("GOOGLE_CLIENT_ID");
  const clientSecret = envTrim("GOOGLE_CLIENT_SECRET");
  const refreshToken = envTrim("GOOGLE_REFRESH_TOKEN");
  const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
  oauth2.setCredentials({ refresh_token: refreshToken });
  return oauth2;
}

/**
 * Upload a PDF buffer into GDRIVE_FOLDER_ID (OAuth user must have access to the folder).
 * @returns {{ ok: true, fileId: string, webViewLink?: string } | { ok: false, error: string } | { ok: false, skipped: true }}
 */
export async function uploadPdfToGoogleDrive({ buffer, fileName }) {
  if (!isGoogleDriveUploadConfigured()) {
    return { ok: false, skipped: true };
  }

  const folderId = envTrim("GDRIVE_FOLDER_ID");

  try {
    const auth = getOAuth2Client();
    const drive = google.drive({ version: "v3", auth });
    const { data } = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [folderId],
      },
      media: {
        mimeType: "application/pdf",
        body: Readable.from(buffer),
      },
      fields: "id, webViewLink",
    });

    return {
      ok: true,
      fileId: data.id,
      webViewLink: data.webViewLink || null,
    };
  } catch (err) {
    const message = err?.message || String(err);
    console.error("Google Drive upload error:", message);
    return { ok: false, error: message };
  }
}

/** Set response headers for client upload status (read before PDF body). */
export function setDriveUploadHeaders(res, result) {
  if (result?.durationMs != null && Number.isFinite(result.durationMs)) {
    res.setHeader("X-Drive-Upload-Ms", String(Math.round(result.durationMs)));
  }
  if (result?.skipped) {
    res.setHeader("X-Drive-Upload", "skipped");
    return;
  }
  if (result?.ok) {
    res.setHeader("X-Drive-Upload", "ok");
    if (result.fileId) res.setHeader("X-Drive-File-Id", result.fileId);
    if (result.webViewLink) res.setHeader("X-Drive-Web-View-Link", result.webViewLink);
    return;
  }
  res.setHeader("X-Drive-Upload", "failed");
  const err = String(result?.error || "Upload failed").slice(0, 240);
  res.setHeader("X-Drive-Error", err);
}
