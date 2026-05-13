/**
 * Check second-prompt templates for unknown {{placeholders}}.
 * Run: npm run validate:prompts
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const SECOND_PROMPT_VARIABLES = [
  "jobDescription",
  "roleTitle",
  "companyName",
  "questions",
  "profileContext",
  "profileJson",
  "resumeOutputJson",
  "tailoredResumeContext",
  "tailoredResumeJson",
];

const CATALOG = [
  { id: "screening", file: "Screeing_Prompt.txt", fallbackFile: "screening.txt" },
  { id: "recruiter-screening", file: "Recruiter_Manual_Screeing_Prompt.txt", fallbackFile: "recruiter-manual-screening.txt" },
  { id: "faq", file: "FAQ_Prompt.txt", fallbackFile: "faq.txt" },
  { id: "technical-experience", file: "Tech_Extraction_Prompt.txt", fallbackFile: "technical-experience.txt" },
];

const PLACEHOLDER_RE = /\{\{(\w+)\}\}/g;

const readIfExists = (filePath) => {
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, "utf-8");
};

const collectPlaceholders = (text) => {
  const found = new Set();
  let m;
  const re = new RegExp(PLACEHOLDER_RE.source, "g");
  while ((m = re.exec(text)) !== null) found.add(m[1]);
  return found;
};

let failed = false;
const primaryDir = path.join(root, "lib", "prompts", "2ndPrompts");
const fallbackDir = path.join(root, "lib", "prompts", "second-prompts");

for (const entry of CATALOG) {
  const primary = readIfExists(path.join(primaryDir, entry.file));
  const fallback = readIfExists(path.join(fallbackDir, entry.fallbackFile));
  const text = (primary && primary.trim() ? primary : fallback) || "";

  if (!text.trim()) {
    console.error(`[MISSING] ${entry.id}: no template in 2ndPrompts or second-prompts`);
    failed = true;
    continue;
  }

  const used = collectPlaceholders(text);
  const allowed = new Set(SECOND_PROMPT_VARIABLES);
  const unknown = [...used].filter((k) => !allowed.has(k));

  if (unknown.length) {
    console.error(`[UNKNOWN VARS] ${entry.id}: ${unknown.join(", ")}`);
    failed = true;
  } else {
    console.log(`[OK] ${entry.id} (${used.size} placeholders)`);
  }
}

if (failed) process.exit(1);
