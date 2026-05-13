import {
  parseTailoredResumeFromText,
  isTailoredResumeInputError,
  buildTemplateDataFromProfileAndResume,
} from "../tailored-resume/index.js";
import { renderPdfToBuffer } from "../render-pdf-buffer.js";
import { loadProfileBySlug } from "../load-profile.js";
import { buildPdfFileName } from "../pdf-filename.js";
import { resolvePdfTemplate } from "../resolve-pdf-template.js";

/** Manual workflow: pasted tailored resume JSON → merge with profile → PDF buffer. */
export async function runManualGenerate({ profileSlug, template, roleName, companyName, content }) {
  const { data: profileData, basename } = await loadProfileBySlug(profileSlug);
  const { templateName, TemplateComponent } = resolvePdfTemplate(profileSlug, template);

  if (!TemplateComponent) {
    const err = new Error(`Template "${templateName}" not found`);
    err.statusCode = 404;
    throw err;
  }

  const expectedExperienceCount = Array.isArray(profileData.experience) ? profileData.experience.length : null;
  const tailoredResume = parseTailoredResumeFromText(content, { expectedExperienceCount });

  const templateData = buildTemplateDataFromProfileAndResume(profileData, tailoredResume);
  const fileName = buildPdfFileName(basename, roleName, companyName);
  const pdfBuffer = await renderPdfToBuffer(TemplateComponent, templateData);

  return { pdfBuffer, fileName };
}

export { isTailoredResumeInputError };
