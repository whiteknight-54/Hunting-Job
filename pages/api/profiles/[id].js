import fs from "fs";
import path from "path";

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: "Profile ID required" });
    }

    const profilePath = path.join(process.cwd(), "resumes", `${id}.json`);

    if (!fs.existsSync(profilePath)) {
      return res.status(404).json({ error: "Profile not found" });
    }

    try {
      const fileContent = fs.readFileSync(profilePath, "utf-8");
      const profileData = JSON.parse(fileContent);
      res.status(200).json(profileData);
    } catch (parseError) {
      console.error(`Error parsing profile JSON for ${id}:`, parseError);
      return res.status(500).json({ error: "Invalid profile data format" });
    }
  } catch (error) {
    console.error("Error reading profile:", error);
    res.status(500).json({ error: "Failed to load profile" });
  }
}
