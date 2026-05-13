import { getPromptForProfile } from "./profile-template-mapping";
import { sanitizeAtsPromptId } from "./ats-prompts";
import { loadAtsPromptTemplate } from "./ats-prompt-loader";
import { buildAtsSubstitutionVariables } from "./resume-prompt-variables";
import { applyPromptVariables } from "./apply-prompt-variables";
import { RESUME_OUTPUT_SCHEMA_APPENDIX } from "./tailored-resume/schema.js";

/**
 * Build a filled ATS resume prompt for a profile + job context.
 * @returns {{ prompt: string, atsPromptUsed: string }}
 */
export async function buildAtsPromptForProfile({
  profileSlug,
  profileData,
  jobDescription,
  atsPromptOverride,
  roleTitle = "",
  companyName = "",
  questions = "",
}) {
  const mappedAts = getPromptForProfile(profileSlug);
  const atsPromptUsed = sanitizeAtsPromptId(atsPromptOverride || mappedAts);
  const promptTemplate = await loadAtsPromptTemplate(atsPromptUsed);

  const variables = buildAtsSubstitutionVariables(profileData, {
    jobDescription,
    roleTitle,
    companyName,
    questions,
  });

  const prompt = `${applyPromptVariables(promptTemplate, variables)}\n\n${RESUME_OUTPUT_SCHEMA_APPENDIX}`;
  return { prompt, atsPromptUsed };
}
