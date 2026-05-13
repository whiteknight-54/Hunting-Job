import path from "path";
import fs from "fs";
import { promises as fsPromises } from "fs";

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

/** Common filename typo alternates (e.g. Screeing vs Screening). */
const filenameAlternates = (filename) => {
  const alternates = new Set();
  if (filename) alternates.add(filename);
  if (/screeing/i.test(filename)) {
    alternates.add(filename.replace(/screeing/gi, "screening"));
    alternates.add(filename.replace(/Screeing/g, "Screening"));
  }
  if (/screeing_prompt/i.test(filename)) {
    alternates.add(filename.replace(/screeing_prompt/gi, "screening_prompt"));
  }
  return [...alternates];
};

const readFirstNonemptyInDir = async (dir, filenames) => {
  for (const name of filenames) {
    const content = await readIfNonempty(path.join(dir, name));
    if (content) return content;
  }
  return null;
};

export const readSecondPromptTemplate = async (secondPromptId) => {
  const entry = resolveSecondPromptCatalogEntry(secondPromptId);
  if (!entry) throw new Error(`Unknown second prompt: ${secondPromptId}`);

  const primaryDir = getSecondPromptsDirectory();
  const fallbackDir = getSecondPromptsFallbackDirectory();

  const primaryNames = filenameAlternates(entry.file);
  const fallbackNames = filenameAlternates(entry.fallbackFile);

  const primary = await readFirstNonemptyInDir(primaryDir, primaryNames);
  if (primary) return primary;

  const fallback = await readFirstNonemptyInDir(fallbackDir, fallbackNames);
  if (fallback) return fallback;

  throw new Error(
    `Second prompt file missing or empty: ${entry.file} (also checked fallback ${entry.fallbackFile})`
  );
};

/** Placeholders available in second-prompt templates (manual_second_prompt API). */
export const SECOND_PROMPT_VARIABLES = [
  "jobDescription",
  "questions",
  "profileContext",
  "profileJson",
  "resumeOutputJson",
  "tailoredResumeContext",
  "tailoredResumeJson",
];
