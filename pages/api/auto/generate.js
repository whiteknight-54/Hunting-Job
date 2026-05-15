import { badRequest, jsonError, methodNotAllowed, serverError } from "../../../lib/core/api-response.js";
import { getAiConfig, normalizeAiSelection } from "../../../lib/core/ai-config.js";
import { respondProfileLoadError } from "../../../lib/core/profile.js";
import { runAutoGenerate } from "../../../lib/services/auto-generate-service.js";
import { sendSlackPdfSuccessReport } from "../../../lib/services/slack-report.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);

  try {
    const envAi = getAiConfig();
    const body = req.body || {};
    const {
      profile: profileSlug,
      jd,
      template,
      roleName,
      companyName = null,
      atsPrompt,
      questions = null,
    } = body;

    const { provider, model } = normalizeAiSelection(
      body.provider ?? envAi.provider,
      body.model ?? envAi.model
    );

    if (!profileSlug) return jsonError(res, 400, "Profile slug required");
    if (!jd) return jsonError(res, 400, "Job description required");
    if (!roleName || !String(roleName).trim()) return jsonError(res, 400, "Role name is required");

    const { pdfStream, fileName, aiUsage, atsPromptUsed } = await runAutoGenerate({
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

    const modelLabel = String(model || "").trim() || `${provider} (default)`;
    void sendSlackPdfSuccessReport({
      fileName,
      aiAgent: modelLabel,
      promptId: atsPromptUsed,
      jd,
    });

    if (aiUsage?.promptTokens != null) res.setHeader("X-AI-Prompt-Tokens", String(aiUsage.promptTokens));
    if (aiUsage?.completionTokens != null) res.setHeader("X-AI-Completion-Tokens", String(aiUsage.completionTokens));
    if (aiUsage?.totalTokens != null) res.setHeader("X-AI-Total-Tokens", String(aiUsage.totalTokens));
    if (aiUsage?.estimatedUsd != null && Number.isFinite(aiUsage.estimatedUsd)) {
      res.setHeader("X-AI-Estimated-USD", String(aiUsage.estimatedUsd));
    }

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
