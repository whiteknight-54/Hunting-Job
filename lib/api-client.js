import { completePdfFromResponse } from "./shared/complete-pdf-response.js";

export async function parseApiError(response) {
  try {
    const data = await response.json();
    return data?.message || data?.error || response.statusText || "Request failed";
  } catch {
    return response.statusText || "Request failed";
  }
}

function filenameFromDisposition(header) {
  if (!header) return null;
  const match = /filename="?([^";\n]+)"?/i.exec(header);
  return match?.[1] || null;
}

/** Read AI usage + rough cost headers from `/api/auto/generate` (set before PDF body). */
export function readAiUsageFromResponseHeaders(response) {
  const p = response.headers.get("X-AI-Prompt-Tokens");
  const c = response.headers.get("X-AI-Completion-Tokens");
  const t = response.headers.get("X-AI-Total-Tokens");
  const u = response.headers.get("X-AI-Estimated-USD");
  const num = (v) => (v != null && v !== "" && Number.isFinite(Number(v)) ? Number(v) : null);
  return {
    promptTokens: num(p),
    completionTokens: num(c),
    totalTokens: num(t),
    estimatedUsd: num(u),
  };
}

/** Read Google Drive upload result from generate response headers. */
export function readDriveUploadFromResponseHeaders(response) {
  const status = response.headers.get("X-Drive-Upload");
  if (!status || status === "skipped") {
    return { status: "skipped" };
  }
  if (status === "ok") {
    return {
      status: "ok",
      fileId: response.headers.get("X-Drive-File-Id") || null,
      webViewLink: response.headers.get("X-Drive-Web-View-Link") || null,
    };
  }
  if (status === "failed") {
    return {
      status: "failed",
      error: response.headers.get("X-Drive-Error") || "Upload failed",
    };
  }
  return { status: "skipped" };
}

/** @deprecated Prefer completePdfFromResponse for phased download/upload timings. */
export async function downloadPdfFromResponse(response, fallbackName = "resume.pdf") {
  return completePdfFromResponse(response, {
    fallbackName,
    driveUploadEnabled: Boolean(
      response.headers.get("X-Drive-Upload") && response.headers.get("X-Drive-Upload") !== "skipped"
    ),
    uploadWallMs: 0,
  });
}
