import { readSecondPromptTemplate, applyTemplateVariables } from "../../lib/second-prompts-registry";
import {
  formatProfileForReview,
  formatTailoredResumeContext,
  tailoredResumeToPrettyJson,
} from "../../lib/profile-format";
import { tryParseTailoredResume } from "../../lib/tailored-resume/index.js";
import { loadProfileBySlug, respondProfileLoadError } from "../../lib/load-profile";
import { jsonError, methodNotAllowed, serverError } from "../../lib/api-response";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);

  try {
    const {
      profile: profileSlug,
      secondPromptId,
      jd,
      roleTitle,
      companyName = "",
      questions = "",
      resumeOutputJson = "",
    } = req.body || {};

    if (!profileSlug) return jsonError(res, 400, "Profile slug required");
    if (!secondPromptId) return jsonError(res, 400, "secondPromptId required");
    if (!jd || !String(jd).trim()) return jsonError(res, 400, "Job description required");
    if (!roleTitle || !String(roleTitle).trim()) return jsonError(res, 400, "Role title required");
    if (!companyName || !String(companyName).trim()) return jsonError(res, 400, "Company name required");

    const { data: profileData } = await loadProfileBySlug(profileSlug);
    const template = await readSecondPromptTemplate(String(secondPromptId));

    const resumeRaw = String(resumeOutputJson || "").trim();
    const resumeContent = tryParseTailoredResume(resumeRaw);

    const variables = {
      jobDescription: String(jd || ""),
      roleTitle: String(roleTitle || "").trim(),
      companyName: String(companyName || "").trim(),
      questions: String(questions || ""),
      profileContext: formatProfileForReview(profileData),
      profileJson: JSON.stringify(profileData, null, 2),
      resumeOutputJson: resumeRaw || "{}",
      tailoredResumeContext: formatTailoredResumeContext(profileData, resumeContent),
      tailoredResumeJson: tailoredResumeToPrettyJson(profileData, resumeContent),
    };

    const prompt = applyTemplateVariables(template, variables);
    return res.status(200).json({ prompt });
  } catch (err) {
    if (respondProfileLoadError(res, err)) return;
    console.error("manual_second_prompt error:", err);
    return serverError(res, "Failed to build second prompt", err?.message || "Unknown error");
  }
}
