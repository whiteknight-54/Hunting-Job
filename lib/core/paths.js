import path from "path";

export const PROJECT_ROOT = process.cwd();
export const PROFILES_DIR = path.join(PROJECT_ROOT, "profiles");
export const ATS_PROMPTS_DIR = path.join(PROJECT_ROOT, "lib", "prompts", "ATS Resume Prompts");
export const SECOND_PROMPTS_DIR = path.join(PROJECT_ROOT, "lib", "prompts", "second-prompts");
