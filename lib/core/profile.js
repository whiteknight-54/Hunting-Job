import fs from "fs/promises";
import path from "path";
import { PROFILES_DIR } from "./paths";
import { getProfileBySlug, getProfileFileBasename } from "../profile-template-mapping";

export class ProfileLoadError extends Error {
  constructor(message, statusCode = 404) {
    super(message);
    this.name = "ProfileLoadError";
    this.statusCode = statusCode;
  }
}

async function readProfileJson(basename) {
  const filePath = path.join(PROFILES_DIR, `${basename}.json`);
  let raw;
  try {
    raw = await fs.readFile(filePath, "utf8");
  } catch {
    throw new ProfileLoadError(`Profile not found: ${basename}`);
  }
  try {
    return JSON.parse(raw);
  } catch {
    throw new ProfileLoadError(`Invalid profile JSON: ${basename}`, 500);
  }
}

export async function loadProfileByFileId(fileId) {
  const basename = String(fileId || "").trim();
  if (!basename || basename.startsWith("_")) {
    throw new ProfileLoadError("Invalid profile id");
  }
  const data = await readProfileJson(basename);
  return { basename, data };
}

export async function loadProfileBySlug(slug) {
  const config = getProfileBySlug(slug);
  const basename = getProfileFileBasename(config);
  if (!basename) throw new ProfileLoadError(`Unknown profile slug: ${slug}`);
  const data = await readProfileJson(basename);
  return { slug, basename, data };
}

export function respondProfileLoadError(res, err) {
  if (err instanceof ProfileLoadError || err?.name === "ProfileLoadError") {
    res.status(err.statusCode || 404).json({ error: err.message });
    return true;
  }
  return false;
}
