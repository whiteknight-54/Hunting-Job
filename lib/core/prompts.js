import fs from "fs/promises";
import path from "path";
import { ATS_PROMPTS_DIR, SECOND_PROMPTS_DIR } from "./paths";
import { memoAsync } from "./server-cache.js";

const PROMPT_LIST_TTL_MS = 60 * 60 * 1000;
const PROMPT_FILE_TTL_MS = 60 * 60 * 1000;

function basenameNoExt(filename) {
  return path.basename(filename, path.extname(filename));
}

async function listTxtIds(dir) {
  return memoAsync(`prompt-list:${dir}`, PROMPT_LIST_TTL_MS, async () => {
    let entries;
    try {
      entries = await fs.readdir(dir);
    } catch {
      return [];
    }
    return entries
      .filter((f) => f.endsWith(".txt") && !f.startsWith("_"))
      .map((f) => basenameNoExt(f))
      .sort();
  });
}

async function readTxt(dir, id) {
  const safe = String(id || "").trim().replace(/[/\\]/g, "");
  if (!safe) throw new Error("Prompt id required");
  return memoAsync(`prompt-file:${dir}:${safe}`, PROMPT_FILE_TTL_MS, async () => {
    const filePath = path.join(dir, `${safe}.txt`);
    try {
      return (await fs.readFile(filePath, "utf8")).trim();
    } catch {
      throw new Error(`Prompt not found: ${safe}`);
    }
  });
}

/** Replace `{{key}}` placeholders in a raw prompt template. */
export function fillPrompt(template, variables = {}) {
  return String(template || "").replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = variables[key];
    if (val === undefined || val === null) return "";
    return typeof val === "string" ? val : JSON.stringify(val, null, 2);
  });
}

export function formatExperienceForPrompt(experience = []) {
  return (Array.isArray(experience) ? experience : [])
    .map((job, i) => {
      const title = job?.title || "Role";
      const company = job?.company || "Company";
      const loc = job?.location ? ` (${job.location})` : "";
      const dates = [job?.start_date, job?.end_date].filter(Boolean).join(" – ");
      const datePart = dates ? ` - (${dates})` : "";
      return `${i + 1}. ${title} @ ${company}${loc}${datePart}`;
    })
    .join("\n");
}

export function formatEducationForPrompt(education = []) {
  return (Array.isArray(education) ? education : [])
    .map((edu, i) => {
      const degree = edu?.degree || "Degree";
      const school = edu?.school || "School";
      const years = [edu?.start_year, edu?.end_year].filter(Boolean).join(" – ");
      const yearPart = years ? ` (${years})` : "";
      return `${i + 1}. ${degree} — ${school}${yearPart}`;
    })
    .join("\n");
}

export async function listAtsPromptIds() {
  return listTxtIds(ATS_PROMPTS_DIR);
}

export async function listSecondPromptIds() {
  return listTxtIds(SECOND_PROMPTS_DIR);
}

export async function readAtsPrompt(id) {
  return readTxt(ATS_PROMPTS_DIR, id);
}

export async function readSecondPrompt(id) {
  return readTxt(SECOND_PROMPTS_DIR, id);
}

export function toPromptCatalog(ids) {
  return ids.map((id) => ({
    id,
    label: id.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
  }));
}

export async function listAtsPromptTemplateIds() {
  return toPromptCatalog(await listAtsPromptIds());
}

export async function listSecondPromptTemplateIds() {
  return toPromptCatalog(await listSecondPromptIds());
}

export const ATS_PLACEHOLDERS = [
  "name",
  "experience",
  "education",
  "jobDescription",
  "questions",
  "roleName",
  "companyName",
];

export const SECOND_PLACEHOLDERS = ["jobDescription", "questions", "tailoredResumeContext"];

export function extractPlaceholders(template) {
  const found = new Set();
  const re = /\{\{(\w+)\}\}/g;
  let m;
  while ((m = re.exec(String(template || ""))) !== null) found.add(m[1]);
  return [...found];
}
