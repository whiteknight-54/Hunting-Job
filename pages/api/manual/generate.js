import { runManualGenerate, isTailoredResumeInputError } from "../../../lib/services/manual-generate-service.js";
import { respondProfileLoadError } from "../../../lib/core/profile.js";
import { badRequest, jsonError, methodNotAllowed, serverError } from "../../../lib/core/api-response.js";
import { sendSlackPdfSuccessReport } from "../../../lib/services/slack-report.js";
import { getPromptForProfile } from "../../../lib/profile-template-mapping.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);

  try {
    const { profile: profileSlug, template, roleName, companyName = null, content, jd, atsPrompt } = req.body || {};

    if (!profileSlug) return jsonError(res, 400, "Profile slug required");
    if (!roleName || !String(roleName).trim()) return jsonError(res, 400, "Role name is required");
    if (!companyName || !String(companyName).trim()) return jsonError(res, 400, "Company name is required");
    if (!content) return jsonError(res, 400, "Pasted content required");

    const { pdfBuffer, fileName } = await runManualGenerate({
      profileSlug,
      template,
      roleName,
      companyName,
      content,
    });

    const promptForSlack = String(atsPrompt ?? "").trim() || getPromptForProfile(profileSlug);

    void sendSlackPdfSuccessReport({
      fileName,
      aiAgent: "ChatGPT",
      promptId: promptForSlack,
      jd: jd != null ? String(jd) : "",
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
