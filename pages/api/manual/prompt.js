import { buildAtsPromptForProfile } from "../../../lib/services/ats-prompt.js";
import { loadProfileBySlug, respondProfileLoadError } from "../../../lib/core/profile.js";
import { jsonError, methodNotAllowed, serverError } from "../../../lib/core/api-response.js";
import { guardApi } from "../../../lib/core/guard-api.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);
  if (!(await guardApi(req, res))) return;

  try {
    const {
      profile: profileSlug,
      jd,
      atsPrompt: atsPromptOverride,
      questions = "",
    } = req.body || {};

    if (!profileSlug) return jsonError(res, 400, "Profile slug required");
    if (!jd) return jsonError(res, 400, "Job description required");

    const { data: profileData } = await loadProfileBySlug(profileSlug);

    const { prompt, atsPromptUsed } = await buildAtsPromptForProfile({
      profileSlug,
      profileData,
      jobDescription: jd,
      atsPromptOverride,
      questions,
    });

    return res.status(200).json({ prompt, atsPromptUsed });
  } catch (err) {
    if (respondProfileLoadError(res, err)) return;
    console.error("Manual prompt error:", err);
    return serverError(res, "Failed to build manual prompt", err?.message || "Unknown error occurred");
  }
}
