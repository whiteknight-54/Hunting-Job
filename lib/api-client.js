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

export async function downloadPdfFromResponse(response, fallbackName = "resume.pdf") {
  if (!response.ok) throw new Error(await parseApiError(response));
  const usage = readAiUsageFromResponseHeaders(response);
  const blob = await response.blob();
  const name =
    filenameFromDisposition(response.headers.get("Content-Disposition")) || fallbackName;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
  return { fileName: name, usage };
}
