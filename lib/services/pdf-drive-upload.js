import { isGoogleDriveUploadConfigured, setDriveUploadHeaders, uploadPdfToGoogleDrive } from "../core/google-drive.js";

export { isGoogleDriveUploadConfigured };

/** Upload PDF to Drive when configured; always returns a result object for headers. */
export async function uploadGeneratedPdfToDrive({ buffer, fileName }) {
  return uploadPdfToGoogleDrive({ buffer, fileName });
}

export function applyDriveUploadHeaders(res, uploadResult) {
  setDriveUploadHeaders(res, uploadResult);
}
