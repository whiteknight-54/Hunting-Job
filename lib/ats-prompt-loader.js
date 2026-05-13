import { readAtsPromptTemplate } from "./ats-prompts";

const templateCache = new Map();

/** Load ATS prompt file text; cached by prompt id (not per-profile). */
export async function loadAtsPromptTemplate(atsPromptName) {
  if (templateCache.has(atsPromptName)) {
    return templateCache.get(atsPromptName);
  }
  const text = await readAtsPromptTemplate(atsPromptName);
  templateCache.set(atsPromptName, text);
  return text;
}
