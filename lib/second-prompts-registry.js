import path from "path";
import fs from "fs";
import { promises as fsPromises } from "fs";

/** User-editable prompts (your plan) */
const PRIMARY_FOLDER = "2ndPrompts";
/** Starter templates shipped with the repo */
const FALLBACK_FOLDER = "second-prompts";

export const getSecondPromptsDirectory = () => path.join(process.cwd(), "lib", "prompts", PRIMARY_FOLDER);

export const getSecondPromptsFallbackDirectory = () => path.join(process.cwd(), "lib", "prompts", FALLBACK_FOLDER);

/** Catalog for UI + API allowlist */
export const SECOND_PROMPT_CATALOG = [
  {
    id: "screening",
    label: "Screening / application questions",
    description: "Answer employer screening or form questions using profile + resume JSON + JD.",
    file: "Screeing_Prompt.txt",
    fallbackFile: "screening.txt",
  },
  {
    id: "recruiter-screening",
    label: "Recruiter manual screening (self-check)",
    description: "Review the tailored resume against the JD before you submit.",
    file: "Recruiter_Manual_Screeing_Prompt.txt",
    fallbackFile: "recruiter-manual-screening.txt",
  },
  {
    id: "faq",
    label: "FAQ / employer messaging",
    description: "Draft short replies or clarifications for recruiters.",
    file: "FAQ_Prompt.txt",
    fallbackFile: "faq.txt",
  },
  {
    id: "technical-experience",
    label: "Technical experience extraction",
    description: "Summarize or extract technical themes for interviews or cover letters.",
    file: "Tech_Extraction_Prompt.txt",
    fallbackFile: "technical-experience.txt",
  },
];

export const resolveSecondPromptCatalogEntry = (id) => SECOND_PROMPT_CATALOG.find((e) => e.id === id) || null;

const readIfNonempty = async (filePath) => {
  if (!fs.existsSync(filePath)) return null;
  const text = await fsPromises.readFile(filePath, "utf-8");
  return text.trim() ? text : null;
};

export const readSecondPromptTemplate = async (secondPromptId) => {
  const entry = resolveSecondPromptCatalogEntry(secondPromptId);
  if (!entry) throw new Error(`Unknown second prompt: ${secondPromptId}`);

  const primaryPath = path.join(getSecondPromptsDirectory(), entry.file);
  const fallbackPath = path.join(getSecondPromptsFallbackDirectory(), entry.fallbackFile);

  const primary = await readIfNonempty(primaryPath);
  if (primary) return primary;

  const fallback = await readIfNonempty(fallbackPath);
  if (fallback) return fallback;

  throw new Error(
    `Second prompt file missing or empty: ${entry.file} (also checked fallback ${entry.fallbackFile})`
  );
};

export const applyTemplateVariables = (template, variables) => {
  let processed = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    processed = processed.replace(regex, String(value ?? ""));
  }
  return processed;
};
