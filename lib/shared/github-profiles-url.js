/**
 * Build a GitHub URL for the current profile JSON from a profiles-folder base URL.
 * Base is typically: https://github.com/org/repo/tree/branch/profiles
 */
export function buildGithubProfileFileUrl(baseUrl, basename) {
  const base = String(baseUrl || "").trim().replace(/\/$/, "");
  if (!base) return null;
  if (!basename) return base;

  const file = `${basename}.json`;
  if (base.includes("/tree/")) {
    return `${base.replace("/tree/", "/edit/")}/${encodeURIComponent(file)}`;
  }
  if (base.includes("/blob/")) {
    return `${base.replace("/blob/", "/edit/")}/${encodeURIComponent(file)}`;
  }
  return `${base}/${encodeURIComponent(file)}`;
}
