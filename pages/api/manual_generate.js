import { runManualGenerate, isTailoredResumeInputError } from "../../lib/services/manual-generate-service";
import { respondProfileLoadError } from "../../lib/load-profile";
import { badRequest, jsonError, methodNotAllowed, serverError } from "../../lib/api-response";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);

  try {
    const { profile: profileSlug, template, roleName, companyName = null, content } = req.body || {};

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
