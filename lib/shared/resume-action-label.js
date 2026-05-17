/**
 * Primary PDF action button label.
 * @param {"manual"|"auto"} [variant]
 * @param {string} [aiModel] — used for auto (`Generate PDF with …`)
 */
export function getResumeActionLabel({ busy, variant = "manual", aiModel = "" }) {
  if (variant === "auto") {
    const model = String(aiModel || "").trim() || "AI";
    const base = `Generate PDF with ${model}`;
    return busy ? `${base}…` : base;
  }
  return busy ? "Generate PDF…" : "Generate PDF";
}

function formatSeconds(seconds) {
  const n = Number(seconds);
  if (!Number.isFinite(n) || n < 0) return "0s";
  return `${Math.floor(n)}s`;
}

/**
 * Progress line during PDF run.
 * @param {"uploading"|"downloading"|"generating"|"generating_resume"|null} phase
 */
export function getPdfBusyStatusLabel({
  phase,
  phaseElapsed = 0,
  driveUploadEnabled,
  busyLabel = "Generating PDF",
  aiModel = "",
}) {
  const t = formatSeconds(phaseElapsed);
  if (phase === "generating_resume") {
    const model = String(aiModel || "").trim();
    return model ? `Generating resume with ${model} ${t}` : `Generating resume ${t}`;
  }
  if (phase === "uploading") return `Uploading PDF ${t}`;
  if (phase === "downloading") return `Downloading PDF ${t}`;
  if (phase === "generating") return `${busyLabel} ${t}`;
  if (driveUploadEnabled) return `Uploading PDF ${t}`;
  return `${busyLabel} ${t}`;
}

function formatUploadResult(driveUpload, uploadSeconds) {
  if (!driveUpload || driveUpload.status === "skipped") {
    return uploadSeconds != null ? `Upload: skipped · ${formatSeconds(uploadSeconds)}` : "Upload: skipped";
  }
  if (driveUpload.status === "ok") {
    return `Upload: OK · ${formatSeconds(uploadSeconds)}`;
  }
  const detail = driveUpload.error ? ` — ${driveUpload.error}` : "";
  return `Upload: failed${detail} · ${formatSeconds(uploadSeconds)}`;
}

/**
 * Success summary: `file.pdf — Download: OK · 1s · Upload: OK · 1s`
 */
export function formatPdfSuccessMessage({
  fileName,
  downloadSeconds,
  uploadSeconds,
  driveUploadEnabled,
  driveUpload,
}) {
  const name = fileName || "resume.pdf";
  let msg = `${name} — Download: OK · ${formatSeconds(downloadSeconds)}`;
  if (driveUploadEnabled) {
    msg += ` · ${formatUploadResult(driveUpload, uploadSeconds)}`;
  }
  return msg;
}
