import { getAiConfig, AI_MODEL_OPTIONS } from "../../lib/core/ai-config.js";
import { isGoogleDriveUploadConfigured } from "../../lib/core/google-drive.js";
import { guardApi } from "../../lib/core/guard-api.js";
import { setConfigCacheHeaders } from "../../lib/core/http-cache.js";

/**
 * GET /api/config
 * Returns client-safe config (Drive folder link, AI model + key status).
 */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!(await guardApi(req, res))) return;
  const folderId = (process.env.GDRIVE_FOLDER_ID || "").trim() || null;
  const githubProfilesUrl = (process.env.GITHUB_PROFILES_URL || "").trim() || null;
  const ai = { ...getAiConfig(), models: AI_MODEL_OPTIONS };
  setConfigCacheHeaders(res);
  return res.status(200).json({
    gdriveFolderId: folderId,
    driveUploadEnabled: isGoogleDriveUploadConfigured(),
    githubProfilesUrl,
    ai,
  });
}
