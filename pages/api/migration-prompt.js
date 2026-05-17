import { readMigrationPromptContent } from "../../lib/core/migration-prompt.js";
import { guardApi } from "../../lib/core/guard-api.js";
import { setStaticListCacheHeaders } from "../../lib/core/http-cache.js";

/**
 * GET /api/migration-prompt
 * Returns public/data/migration-prompt.txt for clipboard copy in profile review.
 */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!(await guardApi(req, res))) return;
  try {
    const content = await readMigrationPromptContent();
    setStaticListCacheHeaders(res);
    return res.status(200).json({ content });
  } catch (err) {
    console.error("Migration prompt read error:", err);
    return res.status(404).json({ error: err?.message || "Migration prompt not found" });
  }
}
