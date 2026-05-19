import { renderPdfToBuffer, resolveTemplateComponent } from "../core/pdf.js";
import {
  assertTailoredResume,
  isTailoredResumeError,
  mergeForPdf,
  parseTailoredJson,
} from "../core/resume.js";
import { resolveProfileForRequest } from "../core/resolve-profile-for-request.js";
import { buildDownloadPdfFilename } from "../core/pdf-filename.js";

export function isTailoredResumeInputError(err) {
  return isTailoredResumeError(err);
}

export async function runManualGenerate({
  profileSlug,
  template,
  roleName,
  companyName,
  content,
  profileOverride = null,
  showPhone = false,
  showLinkedin = true,
}) {
  const { data: profileData, basename } = await resolveProfileForRequest(profileSlug, profileOverride);
  const tailored = assertTailoredResume(
    parseTailoredJson(content),
    (profileData.experience || []).length
  );

  const templateData = mergeForPdf(profileData, tailored, { showPhone, showLinkedin });
  const { component } = await resolveTemplateComponent(profileSlug, template);
  const pdfBuffer = await renderPdfToBuffer(component, templateData);
  const fileName = buildDownloadPdfFilename(roleName, companyName, basename);

  return { pdfBuffer, fileName };
}
