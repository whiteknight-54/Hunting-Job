import { loadProfileByFileId, respondProfileLoadError } from "../../../lib/load-profile";
import { jsonError, methodNotAllowed, serverError } from "../../../lib/api-response";

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, "GET");

  try {
    const { id } = req.query;
    if (!id) return jsonError(res, 400, "Profile ID required");

    const { data } = await loadProfileByFileId(id);
    return res.status(200).json(data);
  } catch (err) {
    if (respondProfileLoadError(res, err)) return;
    console.error("Error reading profile:", err);
    return serverError(res, "Failed to load profile", err?.message);
  }
}
