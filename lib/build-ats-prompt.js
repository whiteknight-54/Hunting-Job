import { getPromptForProfile } from "./profile-template-mapping";
import { sanitizeAtsPromptId } from "./ats-prompts";
import { loadAtsPromptTemplate } from "./ats-prompt-loader";
import { buildAtsSubstitutionVariables } from "./resume-prompt-variables";
import { applyPromptVariables } from "./apply-prompt-variables";
import {
  ATS_PROMPT_GLOSSARY_BLOCK,
  ATS_PROMPT_INPUT_BLOCK,
  ATS_PROMPT_OUTPUT_BLOCK,
} from "./tailored-resume/ats-prompt-blocks.js";

/**
 * Build a filled ATS resume prompt for a profile + job context.
 * @returns {{ prompt: string, atsPromptUsed: string }}
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
  const promptTemplate = await loadAtsPromptTemplate(atsPromptUsed);

  const variables = buildAtsSubstitutionVariables(profileData, {
    jobDescription,
    questions,
  });

  const inputBlock = applyPromptVariables(ATS_PROMPT_INPUT_BLOCK, variables);
  const glossaryBlock = applyPromptVariables(ATS_PROMPT_GLOSSARY_BLOCK, variables);
  const instructions = applyPromptVariables(promptTemplate, variables);
  const outputBlock = applyPromptVariables(ATS_PROMPT_OUTPUT_BLOCK, variables);

  const prompt = [inputBlock, glossaryBlock, instructions, outputBlock].join("\n\n");
  return { prompt, atsPromptUsed };
}
