import { getPromptForProfile } from "../profile-template-mapping.js";
import { fillPrompt, formatEducationForPrompt, formatExperienceForPrompt, readAtsPrompt } from "../core/prompts.js";

export async function buildAtsPromptForProfile({
  profileSlug,
  profileData,
  jobDescription,
  atsPromptOverride,
  questions = "",
  roleName = "",
  companyName = "",
}) {
  const promptId = String(atsPromptOverride || "").trim() || getPromptForProfile(profileSlug);
  const template = await readAtsPrompt(promptId);

  const prompt = fillPrompt(template, {
    name: profileData?.name || "",
    experience: formatExperienceForPrompt(profileData?.experience),
    education: formatEducationForPrompt(profileData?.education),
    jobDescription: String(jobDescription || "").trim(),
    questions: String(questions || "").trim(),
    roleName: String(roleName || "").trim(),
    companyName: String(companyName || "").trim(),
  });

  return { prompt, atsPromptUsed: promptId };
}
