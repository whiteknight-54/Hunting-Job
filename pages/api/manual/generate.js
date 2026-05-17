import { runManualGenerate, isTailoredResumeInputError } from "../../../lib/services/manual-generate-service.js";
import { respondProfileLoadError } from "../../../lib/core/profile.js";
import { badRequest, jsonError, methodNotAllowed, serverError } from "../../../lib/core/api-response.js";
import { sendSlackPdfSuccessReport } from "../../../lib/services/slack-report.js";
import { applyDriveUploadHeaders, uploadGeneratedPdfToDrive } from "../../../lib/services/pdf-drive-upload.js";
import { getPromptForProfile } from "../../../lib/profile-template-mapping.js";
import { guardApi } from "../../../lib/core/guard-api.js";
import { parsePdfGenerateBody } from "../../../lib/shared/pdf-generate-body.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);
  const session = await guardApi(req, res);
  if (!session) return;

  try {
    const { jd, atsPrompt } = req.body || {};
    const body = parsePdfGenerateBody(req.body);

    if (!body.profileSlug) return jsonError(res, 400, "Profile slug required");
    if (!body.roleName) return jsonError(res, 400, "Role name is required");
    if (!body.companyName) return jsonError(res, 400, "Company name is required");
    if (!body.content.trim()) return jsonError(res, 400, "Pasted content required");

    const { pdfBuffer, fileName } = await runManualGenerate({
      profileSlug: body.profileSlug,
      template: body.template,
      roleName: body.roleName,
      companyName: body.companyName,
      content: body.content,
      showPhone: body.showPhone,
      showLinkedin: body.showLinkedin,
    });

    const promptForSlack = String(atsPrompt ?? "").trim() || getPromptForProfile(body.profileSlug);

    const driveUpload = await uploadGeneratedPdfToDrive({ buffer: pdfBuffer, fileName });
    applyDriveUploadHeaders(res, driveUpload);

    void sendSlackPdfSuccessReport({
      fileName,
      aiAgent: "ChatGPT",
      promptId: promptForSlack,
      jd: jd != null ? String(jd) : "",
      driveUpload,
      userName: session.authDisabled ? null : session.name,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    return res.status(200).end(pdfBuffer);
  } catch (err) {
    if (respondProfileLoadError(res, err)) return;
    if (isTailoredResumeInputError(err)) {
      const detail = err.issues?.length ? err.issues.slice(0, 5).join("; ") : err.message;
      return badRequest(res, "Invalid tailored resume JSON", detail);
    }
    if (err?.statusCode === 404) return jsonError(res, 404, "Template not found", err.message);
    console.error("Manual PDF generation error:", err);
    return serverError(res, "Manual PDF generation failed", err?.message || "Unknown error occurred");
  }
}
