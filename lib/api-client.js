/**
 * Browser-side helpers for Next.js API routes.
 */

/** Parse JSON error body from a failed fetch response. */
export async function parseApiError(response) {
  const fallback = response.statusText || `Request failed (${response.status})`;
  try {
    const text = await response.text();
    if (!text) return fallback;
    try {
      const data = JSON.parse(text);
      if (data?.message) return data.message;
      if (data?.error) return data.error;
    } catch {
      return text.length > 280 ? `${text.slice(0, 280)}…` : text;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

/** Trigger a file download from a successful PDF response. */
export async function downloadPdfFromResponse(response, fallbackFilename) {
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;

  let filename = fallbackFilename;
  const contentDisposition = response.headers.get("Content-Disposition");
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="(.+)"/);
    if (match) filename = match[1];
  }

  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(anchor);
}
