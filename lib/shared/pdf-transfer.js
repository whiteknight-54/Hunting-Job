import { downloadPdfFromResponse, parseApiError } from "../api-client.js";

export const PDF_TRANSFER_PHASE = Object.freeze({
  GENERATING: "generating",
  UPLOADING: "uploading",
  DOWNLOADING: "downloading",
});

/** Delay before showing "Uploading" while waiting on server (Drive enabled). */
export const PDF_UPLOAD_LABEL_DELAY_MS = 500;

export function msToSeconds(ms) {
  if (ms == null || !Number.isFinite(ms)) return 0;
  return Math.max(0, Math.round((ms / 1000) * 10) / 10);
}

export function getPdfPhaseLabel(phase, { busyLabel = "Generating PDF" } = {}) {
  if (phase === PDF_TRANSFER_PHASE.UPLOADING) return "Uploading";
  if (phase === PDF_TRANSFER_PHASE.DOWNLOADING) return "Downloading";
  return busyLabel;
}

/**
 * Fetch PDF, show generating → uploading (if Drive) → downloading phases, then save locally.
 */
export async function runPdfGenerateTransfer({
  driveUploadEnabled,
  setPhase,
  fetchResponse,
  fallbackFileName,
}) {
  setPhase(PDF_TRANSFER_PHASE.GENERATING);
  let uploadTimer;
  if (driveUploadEnabled) {
    uploadTimer = setTimeout(() => setPhase(PDF_TRANSFER_PHASE.UPLOADING), PDF_UPLOAD_LABEL_DELAY_MS);
  }

  try {
    const response = await fetchResponse();
    clearTimeout(uploadTimer);
    if (!response.ok) throw new Error(await parseApiError(response));
    setPhase(PDF_TRANSFER_PHASE.DOWNLOADING);
    return await downloadPdfFromResponse(response, fallbackFileName, {
      onPhase: () => setPhase(PDF_TRANSFER_PHASE.DOWNLOADING),
    });
  } finally {
    clearTimeout(uploadTimer);
    setPhase(null);
  }
}
