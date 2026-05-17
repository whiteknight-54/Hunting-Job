import {
  fillPrompt,
  listSecondPromptTemplateIds,
  readSecondPrompt,
} from "../../../lib/core/prompts.js";
import { formatTailoredResumeContext } from "../../../lib/profile-format.js";
import { tryParseTailoredJson } from "../../../lib/core/resume.js";
import { loadProfileBySlug, respondProfileLoadError } from "../../../lib/core/profile.js";
import { jsonError, methodNotAllowed, serverError } from "../../../lib/core/api-response.js";
import { guardApi } from "../../../lib/core/guard-api.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);
  if (!(await guardApi(req, res))) return;

  try {
    const {
      profile: profileSlug,
      secondPromptId,
      jd,
      questions = "",
      resumeOutputJson = "",
    } = req.body || {};

    if (!profileSlug) return jsonError(res, 400, "Profile slug required");
    if (!secondPromptId) return jsonError(res, 400, "secondPromptId required");
    if (!jd || !String(jd).trim()) return jsonError(res, 400, "Job description required");

    const { data: profileData } = await loadProfileBySlug(profileSlug);
    const template = await readSecondPrompt(String(secondPromptId));

    const resumeRaw = String(resumeOutputJson || "").trim();
    const resumeContent = tryParseTailoredJson(resumeRaw);

    const prompt = fillPrompt(template, {
      jobDescription: String(jd || ""),
      questions: String(questions || ""),
      tailoredResumeContext: formatTailoredResumeContext(profileData, resumeContent),
    });

    return res.status(200).json({ prompt });
  } catch (err) {
    if (respondProfileLoadError(res, err)) return;
    console.error("manual_second_prompt error:", err);
    return serverError(res, "Failed to build second prompt", err?.message || "Unknown error");
  }
}
