import { badRequest, jsonError, methodNotAllowed, serverError } from "../../lib/api-response";
import { respondProfileLoadError } from "../../lib/load-profile";
import { runAutoGenerate } from "../../lib/services/auto-generate-service";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);

  try {
    const {
      profile: profileSlug,
      jd,
      template,
      provider = "openai",
      model = null,
      roleName,
      companyName = null,
      atsPrompt,
      questions = null,
    } = req.body || {};

    if (!profileSlug) return jsonError(res, 400, "Profile slug required");
    if (!jd) return jsonError(res, 400, "Job description required");
    if (!roleName || !String(roleName).trim()) return jsonError(res, 400, "Role name is required");

    const { pdfStream, fileName } = await runAutoGenerate({
      profileSlug,
      jd,
      template,
      provider,
      model,
      roleName,
      companyName,
      atsPrompt,
      questions,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    for await (const chunk of pdfStream) {
      res.write(chunk);
    }
    return res.end();
  } catch (err) {
    if (respondProfileLoadError(res, err)) return;
    if (res.headersSent) return;
    if (err?.statusCode === 422 || err?.statusCode === 400) {
      return badRequest(res, "Invalid AI resume output", err.message);
    }
    if (err?.statusCode === 404) return jsonError(res, 404, "Not found", err.message);

    let message = err?.message || "Unknown error occurred";
    if (err?.status === 403) {
      const detail = err?.error?.error?.message || err?.message;
      message = detail ? `API access denied (403). ${detail}` : "API access denied (403). Check API keys.";
    }
    return serverError(res, "PDF generation failed", message);
  }
}
