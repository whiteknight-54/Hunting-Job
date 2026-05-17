function nonEmpty(value) {
  return String(value || "").trim();
}

/** Ensure LinkedIn profile URLs work as PDF link targets. */
export function normalizeLinkedInUrl(value) {
  const v = nonEmpty(value);
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  if (/^linkedin\.com/i.test(v)) return `https://${v}`;
  if (/^www\./i.test(v)) return `https://${v}`;
  return `https://${v.replace(/^\/+/, "")}`;
}

/** Ordered contact segments for PDF header (LinkedIn is a link labeled "linkedin"). */
export function buildContactParts(data) {
  const parts = [];
  const email = nonEmpty(data?.email);
  const phone = nonEmpty(data?.phone);
  const location = nonEmpty(data?.location);
  const linkedin = nonEmpty(data?.linkedin);

  if (email) parts.push({ kind: "text", value: email });
  if (phone) parts.push({ kind: "text", value: phone });
  if (location) parts.push({ kind: "text", value: location });
  if (linkedin) {
    parts.push({
      kind: "link",
      href: normalizeLinkedInUrl(linkedin),
      label: "linkedin",
    });
  }
  return parts;
}
