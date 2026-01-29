/**
 * GET /api/config
 * Returns client-safe config (e.g. GDRIVE_FOLDER_ID for Drive folder link).
 */
export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const folderId = (process.env.GDRIVE_FOLDER_ID || "").trim() || null;
  return res.status(200).json({ gdriveFolderId: folderId });
}
