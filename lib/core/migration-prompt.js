import fs from "fs/promises";
import path from "path";
import { PROFILES_DIR } from "./paths.js";

const MIGRATION_PROMPT_FILE = "migration prompt.txt";

export async function readMigrationPromptContent() {
  const filePath = path.join(PROFILES_DIR, MIGRATION_PROMPT_FILE);
  try {
    return (await fs.readFile(filePath, "utf8")).trim();
  } catch {
    throw new Error("Migration prompt not found");
  }
}
