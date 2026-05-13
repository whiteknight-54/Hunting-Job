import path from "path";
import fs from "fs";
import { promises as fsPromises } from "fs";

const ATS_FOLDER = "ATS Resume Prompts";

export const getAtsPromptsDirectory = () => path.join(process.cwd(), "lib", "prompts", ATS_FOLDER);

/**
 * List ATS prompt template basenames (without .txt), sorted.
 */
export const listAtsPromptTemplateIds = async () => {
  const dir = getAtsPromptsDirectory();
  if (!fs.existsSync(dir)) return [];
  const entries = await fsPromises.readdir(dir);
  return entries
    .filter((f) => f.endsWith(".txt"))
    .map((f) => f.replace(/\.txt$/i, ""))
    .sort((a, b) => a.localeCompare(b));
};

export const readAtsPromptTemplateSync = (promptBasename) => {
  const dir = getAtsPromptsDirectory();
  const primary = path.join(dir, `${promptBasename}.txt`);
  const fallback = path.join(dir, "default.txt");
  if (fs.existsSync(primary)) return fs.readFileSync(primary, "utf-8");
  if (fs.existsSync(fallback)) return fs.readFileSync(fallback, "utf-8");
  throw new Error(`ATS prompt not found: ${promptBasename} (and default.txt missing)`);
};

export const readAtsPromptTemplate = async (promptBasename) => {
  const dir = getAtsPromptsDirectory();
  const primary = path.join(dir, `${promptBasename}.txt`);
  const fallback = path.join(dir, "default.txt");
  if (fs.existsSync(primary)) return fsPromises.readFile(primary, "utf-8");
  if (fs.existsSync(fallback)) return fsPromises.readFile(fallback, "utf-8");
  throw new Error(`ATS prompt not found: ${promptBasename} (and default.txt missing)`);
};

/** Allow only safe filename stem characters */
export const sanitizeAtsPromptId = (raw) => {
  const s = String(raw || "").trim();
  if (!s) return "default";
  const cleaned = s.replace(/[^a-zA-Z0-9_-]/g, "");
  return cleaned || "default";
};
