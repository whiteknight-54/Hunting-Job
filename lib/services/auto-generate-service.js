import { buildAtsPromptForProfile } from "../services/ats-prompt.js";
import { runAtsPrompt } from "../core/ai.js";
import { estimateCostUsdForTokens, getDefaultModel } from "../core/ai-config.js";
import { renderPdfToBuffer, resolveTemplateComponent } from "../core/pdf.js";
import {
  assertTailoredResume,
  mergeForPdf,
  parseTailoredJson,
} from "../core/resume.js";
import { loadProfileBySlug } from "../core/profile.js";
import { buildDownloadPdfFilename } from "../core/pdf-filename.js";

export async function runAutoGenerate({
  profileSlug,
  jd,
  template,
  provider = "openai",
  model = null,
  roleName,
  companyName = null,
  atsPrompt,
  questions = null,
  showPhone = false,
  showLinkedin = true,
}) {
  const { data: profileData, basename } = await loadProfileBySlug(profileSlug);

  const { prompt, atsPromptUsed } = await buildAtsPromptForProfile({
    profileSlug,
    profileData,
    jobDescription: jd,
    atsPromptOverride: atsPrompt,
    questions,
    roleName,
    companyName,
  });

  const { raw: aiRaw, usage: aiUsageRaw } = await runAtsPrompt({ prompt, provider, model });
  const modelId = String(model || "").trim() || getDefaultModel(provider);
  const estimatedUsd =
    aiUsageRaw &&
    estimateCostUsdForTokens(provider, modelId, aiUsageRaw.promptTokens, aiUsageRaw.completionTokens);
  const aiUsage =
    aiUsageRaw != null
      ? { ...aiUsageRaw, estimatedUsd: estimatedUsd != null ? estimatedUsd : null }
      : { promptTokens: null, completionTokens: null, totalTokens: null, estimatedUsd: null };

  const tailored = assertTailoredResume(
    parseTailoredJson(aiRaw),
    (profileData.experience || []).length
  );

  const templateData = mergeForPdf(profileData, tailored, { showPhone, showLinkedin });
  const { component } = await resolveTemplateComponent(profileSlug, template);
  const pdfBuffer = await renderPdfToBuffer(component, templateData);

  const fileName = buildDownloadPdfFilename(roleName, companyName, basename);
  return { pdfBuffer, fileName, tailored, aiUsage, atsPromptUsed };
}
