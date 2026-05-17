import { parsePdfContactFlags } from "./pdf-contact-prefs.js";

/** Shared POST body fields for manual/auto PDF routes. */
export function parsePdfGenerateBody(body = {}) {
  return {
    profileSlug: String(body.profile || "").trim(),
    template: body.template != null ? String(body.template).trim() : "",
    roleName: body.roleName != null ? String(body.roleName).trim() : "",
    companyName: body.companyName != null ? String(body.companyName).trim() : "",
    content: body.content != null ? String(body.content) : "",
    ...parsePdfContactFlags(body),
  };
}

export function parsePdfPreviewBody(body = {}) {
  const parsed = parsePdfGenerateBody(body);
  return {
    profileSlug: parsed.profileSlug,
    template: parsed.template,
    content: parsed.content,
    showPhone: parsed.showPhone,
    showLinkedin: parsed.showLinkedin,
  };
}
