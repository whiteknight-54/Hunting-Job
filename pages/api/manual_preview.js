import { tryParseTailoredResume, buildTemplateDataFromProfileAndResume } from "../../lib/tailored-resume/index.js";
import { getPreviewMockDataForProfile } from "../../lib/preview-mock-data";
import { renderPdfToBuffer } from "../../lib/render-pdf-buffer";
import { loadProfileBySlug, respondProfileLoadError } from "../../lib/load-profile";
import { resolvePdfTemplate } from "../../lib/resolve-pdf-template";
import { jsonError, methodNotAllowed, serverError } from "../../lib/api-response";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);

  try {
    const { profile: profileSlug, template, content } = req.body || {};

    if (!profileSlug) return jsonError(res, 400, "Profile slug required");

    const { data: profileData } = await loadProfileBySlug(profileSlug);

    const { templateName, TemplateComponent } = resolvePdfTemplate(profileSlug, template);
    if (!TemplateComponent) {
      return jsonError(res, 404, "Template not found", `Template "${templateName}" not found`);
    }

    const tailoredResume = tryParseTailoredResume(content);
    const usingLiveData = !!tailoredResume;

    const templateData = usingLiveData
      ? buildTemplateDataFromProfileAndResume(profileData, tailoredResume)
      : getPreviewMockDataForProfile(profileData);

    const pdfBuffer = await renderPdfToBuffer(TemplateComponent, templateData);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="preview-${templateName}.pdf"`);
    res.setHeader("X-Preview-Mode", usingLiveData ? "live" : "sample");
    return res.status(200).end(pdfBuffer);
  } catch (err) {
    if (respondProfileLoadError(res, err)) return;
    console.error("Manual preview error:", err);
    return serverError(res, "Preview generation failed", err?.message || "Unknown error");
  }
}
