import { loadProfileByFileId, respondProfileLoadError } from "../../../lib/core/profile.js";
import { jsonError, methodNotAllowed, serverError } from "../../../lib/core/api-response.js";
import { guardApi } from "../../../lib/core/guard-api.js";
import { setProfileCacheHeaders } from "../../../lib/core/http-cache.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, "GET");
  if (!(await guardApi(req, res))) return;

  try {
    const { id } = req.query;
    if (!id) return jsonError(res, 400, "Profile ID required");

    const { data } = await loadProfileByFileId(id);
    setProfileCacheHeaders(res);
    return res.status(200).json(data);
  } catch (err) {
    if (respondProfileLoadError(res, err)) return;
    console.error("Error reading profile:", err);
    return serverError(res, "Failed to load profile", err?.message);
  }
}
