import { parseApiError, readAiUsageFromResponseHeaders, readDriveUploadFromResponseHeaders } from "../api-client.js";

function filenameFromDisposition(header) {
  if (!header) return null;
  const match = /filename="?([^";\n]+)"?/i.exec(header);
  return match?.[1] || null;
}

function headerMs(response, name) {
  const raw = response.headers.get(name);
  if (raw == null || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/** Server-reported upload phase (PDF build + Drive) in whole seconds. */
export function uploadSecondsFromResponse(response, driveUploadEnabled, wallMs) {
  if (!driveUploadEnabled) return null;
  const genMs = headerMs(response, "X-Pdf-Generate-Ms");
  const upMs = headerMs(response, "X-Drive-Upload-Ms");
  if (genMs != null || upMs != null) {
    return Math.max(0, Math.floor(((genMs || 0) + (upMs || 0)) / 1000));
  }
  return Math.max(0, Math.floor(wallMs / 1000));
}

function triggerBrowserDownload(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * After fetch resolves: read headers, download blob, return timings for UI.
 * @param {(phase: string) => void} [onPhase]
 */
export async function completePdfFromResponse(response, { fallbackName, driveUploadEnabled, uploadWallMs, onPhase }) {
  if (!response.ok) throw new Error(await parseApiError(response));

  const usage = readAiUsageFromResponseHeaders(response);
  const driveUpload = readDriveUploadFromResponseHeaders(response);
  const uploadSeconds = uploadSecondsFromResponse(response, driveUploadEnabled, uploadWallMs);

  onPhase?.("downloading");
  const downloadStart = Date.now();
  const blob = await response.blob();
  const name = filenameFromDisposition(response.headers.get("Content-Disposition")) || fallbackName;
  triggerBrowserDownload(blob, name);
  const downloadSeconds = Math.max(0, Math.floor((Date.now() - downloadStart) / 1000));

  return {
    fileName: name,
    usage,
    driveUpload,
    downloadSeconds,
    uploadSeconds: driveUploadEnabled ? uploadSeconds : null,
  };
}
