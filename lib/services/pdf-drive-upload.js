import { isGoogleDriveUploadConfigured, setDriveUploadHeaders, uploadPdfToGoogleDrive } from "../core/google-drive.js";

export { isGoogleDriveUploadConfigured };

/** Upload PDF to Drive when configured; always returns a result object for headers. */
export async function uploadGeneratedPdfToDrive({ buffer, fileName }) {
  const started = Date.now();
  const result = await uploadPdfToGoogleDrive({ buffer, fileName });
  return { ...result, durationMs: Date.now() - started };
}

export function applyDriveUploadHeaders(res, uploadResult) {
  setDriveUploadHeaders(res, uploadResult);
}
