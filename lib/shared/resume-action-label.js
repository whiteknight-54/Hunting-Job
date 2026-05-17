/** Primary PDF action label when Drive upload env is configured vs local download only. */
export function getResumeActionLabel({ busy, driveUploadEnabled, busyLabel = "Generating" }) {
  if (busy) {
    return driveUploadEnabled ? "Uploading…" : `${busyLabel}…`;
  }
  return driveUploadEnabled ? "Upload Resume" : "Download Resume";
}

/** Success line after PDF run (includes Drive upload result when applicable). */
export function formatPdfSuccessMessage({ seconds, driveUploadEnabled, driveUpload }) {
  const time = `${seconds}s`;
  if (!driveUploadEnabled) {
    return `PDF generated in ${time}`;
  }
  if (driveUpload?.status === "ok") {
    return `Resume uploaded in ${time}`;
  }
  if (driveUpload?.status === "failed") {
    const detail = driveUpload.error ? ` — ${driveUpload.error}` : "";
    return `PDF saved locally in ${time} · Drive upload failed${detail}`;
  }
  return `PDF generated in ${time}`;
}
