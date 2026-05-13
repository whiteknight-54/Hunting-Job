import { readAtsPromptTemplateSync, sanitizeAtsPromptId } from "./ats-prompts";
import { getPromptForProfile } from "./profile-template-mapping";

/**
 * Load and process an ATS prompt template (lib/prompts/ATS Resume Prompts/).
 * @param {string} promptName - Basename without .txt
 * @param {object} variables - Variables to replace {{key}}
 */
export const loadPrompt = (promptName, variables = {}) => {
  const safe = sanitizeAtsPromptId(promptName);
  const promptTemplate = readAtsPromptTemplateSync(safe);
  return processPromptTemplate(promptTemplate, variables);
};

const processPromptTemplate = (template, variables) => {
  let processed = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    processed = processed.replace(regex, String(value || ""));
  }
  return processed;
};

/**
 * @param {string} profileId - Mapping slug (e.g. "jf")
 */
export const loadPromptForProfile = (profileId, variables = {}) => {
  const promptName = getPromptForProfile(profileId);
  return loadPrompt(promptName, variables);
};

export default { loadPrompt, loadPromptForProfile };
