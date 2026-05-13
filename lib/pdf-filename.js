const SANITIZE_PATTERN = /[^A-Za-z0-9_-]/g;
const SPACE_PATTERN = /\s+/g;

/**
 * Build a sanitized PDF attachment basename: {First_Last}_{role}_{company?}.pdf
 * @param {string} profileBasename - profiles/ file id (e.g. "Joao_Franco")
 */
export function buildPdfFileName(profileBasename, roleName, companyName = null) {
  const nameParts = profileBasename ? String(profileBasename).trim().split(/\s+/) : [];
  let baseName;
  if (nameParts.length === 0) baseName = "resume";
  else if (nameParts.length === 1) baseName = nameParts[0].replace(SANITIZE_PATTERN, "");
  else baseName = `${nameParts[0]}_${nameParts[nameParts.length - 1]}`.replace(SANITIZE_PATTERN, "");

  const sanitizedRole = String(roleName || "")
    .trim()
    .replace(SPACE_PATTERN, "_")
    .replace(SANITIZE_PATTERN, "");
  if (sanitizedRole) baseName = `${baseName}_${sanitizedRole}`;

  const company = companyName && String(companyName).trim();
  if (company) {
    const sanitizedCompany = company.replace(SPACE_PATTERN, "_").replace(SANITIZE_PATTERN, "");
    if (sanitizedCompany) baseName = `${baseName}_${sanitizedCompany}`;
  }

  return `${baseName}.pdf`;
}
