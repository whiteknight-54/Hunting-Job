import {
  assertTailoredResume,
  isTailoredResumeError,
  mergeForPdf,
  parseTailoredJson,
} from "../../../lib/core/resume.js";
import { getPreviewMockDataForProfile } from "../../../lib/preview-mock-data.js";
import { renderPdfToBuffer, resolvePdfTemplate } from "../../../lib/core/pdf.js";
import { loadProfileBySlug, respondProfileLoadError } from "../../../lib/core/profile.js";
import { badRequest, jsonError, methodNotAllowed, serverError } from "../../../lib/core/api-response.js";
import { guardApi } from "../../../lib/core/guard-api.js";
import { parsePdfPreviewBody } from "../../../lib/shared/pdf-generate-body.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);
  if (!(await guardApi(req, res))) return;

  try {
    const body = parsePdfPreviewBody(req.body);

    if (!body.profileSlug) return jsonError(res, 400, "Profile slug required");

    const { data: profileData } = await loadProfileBySlug(body.profileSlug);

    const { templateName, TemplateComponent } = await resolvePdfTemplate(body.profileSlug, body.template);
    if (!TemplateComponent) {
      return jsonError(res, 404, "Template not found", `Template "${templateName}" not found`);
    }

    const trimmedContent = String(body.content || "").trim();
    let tailoredResume = null;
    let usingLiveData = false;

    if (trimmedContent) {
      try {
        tailoredResume = assertTailoredResume(
          parseTailoredJson(body.content),
          (profileData.experience || []).length
        );
        usingLiveData = true;
      } catch (err) {
        if (isTailoredResumeError(err)) {
          const detail = err.issues?.length ? err.issues.slice(0, 5).join("; ") : err.message;
          return badRequest(res, "Invalid tailored resume JSON", detail);
        }
        throw err;
      }
    }

    const contactFlags = { showPhone: body.showPhone, showLinkedin: body.showLinkedin };

    const templateData = usingLiveData
      ? mergeForPdf(profileData, tailoredResume, contactFlags)
      : getPreviewMockDataForProfile(profileData, contactFlags);

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
