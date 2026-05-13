import path from "path";

export const PROFILES_DIR = path.join(process.cwd(), "profiles");

export function profileJsonPath(basename) {
  return path.join(PROFILES_DIR, `${basename}.json`);
}
