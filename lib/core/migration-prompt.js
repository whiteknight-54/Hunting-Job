import fs from "fs/promises";
import path from "path";
import { PROFILES_DIR } from "./paths.js";
import { memoAsync } from "./server-cache.js";

const MIGRATION_PROMPT_FILE = "migration prompt.txt";
const MIGRATION_PROMPT_TTL_MS = 60 * 60 * 1000;

export async function readMigrationPromptContent() {
  return memoAsync("migration-prompt", MIGRATION_PROMPT_TTL_MS, async () => {
    const filePath = path.join(PROFILES_DIR, MIGRATION_PROMPT_FILE);
    try {
      return (await fs.readFile(filePath, "utf8")).trim();
    } catch {
      throw new Error("Migration prompt not found");
    }
  });
}
