/** Primary PDF action label when Drive upload env is configured vs local download only. */
export function getResumeActionLabel({ busy, driveUploadEnabled, busyLabel = "Generating" }) {
  if (busy) {
    return driveUploadEnabled ? "Download & upload…" : `${busyLabel}…`;
  }
  return driveUploadEnabled ? "Download & upload" : "Download Resume";
}

/** Progress line while PDF is generating (download always runs; upload when Drive is on). */
export function getPdfBusyStatusLabel({ driveUploadEnabled, busyLabel = "Generating PDF" }) {
  return driveUploadEnabled ? "Downloading, then uploading to Drive…" : `${busyLabel}…`;
}

function formatUploadStatus(driveUpload) {
  if (!driveUpload || driveUpload.status === "skipped") return "Upload: skipped";
  if (driveUpload.status === "ok") return "Upload: OK";
  const detail = driveUpload.error ? ` — ${driveUpload.error}` : "";
  return `Upload: failed${detail}`;
}

/**
 * Success summary after generate — when Drive is enabled, reports download + upload separately.
 * @param {string} [fileName] — downloaded PDF filename
 */
export function formatPdfSuccessMessage({ seconds, driveUploadEnabled, driveUpload, fileName }) {
  const time = `${seconds}s`;
  const nameSuffix = fileName ? ` (${fileName})` : "";

  if (!driveUploadEnabled) {
    return `Download: OK${nameSuffix} · ${time}`;
  }

  return `Download: OK${nameSuffix} · ${time} · ${formatUploadStatus(driveUpload)}`;
}
