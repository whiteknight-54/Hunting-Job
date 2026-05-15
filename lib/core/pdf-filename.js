/**
 * Safe single segment for PDF download names (no path separators / OS-invalid chars).
 */
export function sanitizeFilenamePart(value) {
  return String(value || "")
    .trim()
    .replace(/[<>:"/\\|?*]+/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 80);
}

/**
 * Downloaded resume PDF: {ProfileBasename}_{Role}_{Company}.pdf
 * Empty segments fall back to resume / Role / Company respectively.
 */
export function buildDownloadPdfFilename(roleName, companyName, profileBasename) {
  const base = sanitizeFilenamePart(profileBasename) || "resume";
  const role = sanitizeFilenamePart(roleName) || "Role";
  const company = sanitizeFilenamePart(companyName) || "Company";
  return `${base}_${role}_${company}.pdf`;
}
