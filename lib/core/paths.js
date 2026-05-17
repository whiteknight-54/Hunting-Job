import path from "path";

export const PROJECT_ROOT = process.cwd();
export const PUBLIC_DIR = path.join(PROJECT_ROOT, "public");

/** Candidate JSON + prompts — under public for deploy layout; blocked from HTTP in middleware. */
export const PUBLIC_DATA_DIR = path.join(PUBLIC_DIR, "data");
export const PROFILES_DIR = path.join(PUBLIC_DATA_DIR, "profiles");
export const ATS_PROMPTS_DIR = path.join(PUBLIC_DATA_DIR, "prompts", "ats");
export const SECOND_PROMPTS_DIR = path.join(PUBLIC_DATA_DIR, "prompts", "second");
export const MIGRATION_PROMPT_FILE = path.join(PUBLIC_DATA_DIR, "migration-prompt.txt");

/** Brand + UI icons (served at /brand/* and /icons/*). */
export const PUBLIC_BRAND_DIR = path.join(PUBLIC_DIR, "brand");
export const PUBLIC_ICONS_DIR = path.join(PUBLIC_DIR, "icons");
