import { getPromptForProfile } from "./profile-template-mapping";
import { sanitizeAtsPromptId } from "./ats-prompts";
import { loadAtsPromptTemplate } from "./ats-prompt-loader";
import { buildAtsSubstitutionVariables } from "./resume-prompt-variables";
import { composeAtsPrompt } from "./compose-ats-prompt";

/**
 * Build a career-customized ATS resume prompt for a profile + job context.
 * INPUT/GLOSSARY/OUTPUT are composed per profile; variant .txt supplies high-level instructions only.
 * @returns {{ prompt: string, atsPromptUsed: string, blocks: object, unreplaced: string[] }}
 */
export async function buildAtsPromptForProfile({
  profileSlug,
  profileData,
  jobDescription,
  atsPromptOverride,
  questions = "",
}) {
  const mappedAts = getPromptForProfile(profileSlug);
  const atsPromptUsed = sanitizeAtsPromptId(atsPromptOverride || mappedAts);
  const instructionTemplate = await loadAtsPromptTemplate(atsPromptUsed);

  const variables = buildAtsSubstitutionVariables(profileData, {
    jobDescription,
    questions,
  });

  const { prompt, blocks, unreplaced } = composeAtsPrompt({
    variables,
    instructionTemplate,
  });

  if (unreplaced.length) {
    console.warn(
      `[buildAtsPromptForProfile] Unreplaced placeholders in ${atsPromptUsed}: ${unreplaced.join(", ")}`
    );
  }

  return { prompt, atsPromptUsed, blocks, unreplaced };
}
