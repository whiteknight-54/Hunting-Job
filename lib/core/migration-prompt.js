import fs from "fs/promises";
import { MIGRATION_PROMPT_FILE } from "./paths.js";
import { memoAsync } from "./server-cache.js";

const MIGRATION_PROMPT_TTL_MS = 60 * 60 * 1000;

export async function readMigrationPromptContent() {
  return memoAsync("migration-prompt", MIGRATION_PROMPT_TTL_MS, async () => {
    try {
      return (await fs.readFile(MIGRATION_PROMPT_FILE, "utf8")).trim();
    } catch {
      throw new Error("Migration prompt not found");
    }
  });
}
