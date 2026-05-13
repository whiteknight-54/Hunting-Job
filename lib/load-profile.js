import { promises as fsPromises } from "fs";
import { jsonError } from "./api-response";
import { getProfileBySlug, getProfileFileBasename } from "./profile-template-mapping";
import { profileJsonPath } from "./profiles-dir";

export class ProfileLoadError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "ProfileLoadError";
    this.code = code;
  }
}

/**
 * Load profile JSON by mapping slug (e.g. "jf").
 * @returns {{ data: object, basename: string, config: object, slug: string }}
 */
export async function loadProfileBySlug(slug) {
  const config = getProfileBySlug(slug);
  if (!config) {
    throw new ProfileLoadError("NOT_FOUND", `Profile with slug "${slug}" not found`);
  }
  const basename = getProfileFileBasename(config);
  if (!basename) {
    throw new ProfileLoadError("NOT_CONFIGURED", `No profile file mapped for slug "${slug}"`);
  }
  const loaded = await loadProfileByFileId(basename);
  return { ...loaded, config, slug };
}

/**
 * Load profile JSON by file basename (e.g. "Joao_Franco").
 */
export async function loadProfileByFileId(fileId) {
  const profilePath = profileJsonPath(fileId);
  try {
    const content = await fsPromises.readFile(profilePath, "utf-8");
    const data = JSON.parse(content);
    return { data, basename: fileId };
  } catch (err) {
    if (err?.code === "ENOENT") {
      throw new ProfileLoadError("FILE_NOT_FOUND", `Profile file "${fileId}.json" not found`);
    }
    if (err instanceof SyntaxError) {
      throw new ProfileLoadError("INVALID_JSON", `Invalid JSON in profile "${fileId}.json"`);
    }
    throw err;
  }
}

/** Map ProfileLoadError to HTTP response; returns true if handled. */
export function respondProfileLoadError(res, err) {
  if (!(err instanceof ProfileLoadError)) return false;
  if (err.code === "NOT_FOUND" || err.code === "NOT_CONFIGURED" || err.code === "FILE_NOT_FOUND") {
    jsonError(res, 404, "Profile not found", err.message);
    return true;
  }
  if (err.code === "INVALID_JSON") {
    jsonError(res, 500, "Invalid profile data", err.message);
    return true;
  }
  return false;
}
