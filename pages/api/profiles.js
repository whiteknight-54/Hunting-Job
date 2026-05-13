import fs from "fs";
import { PROFILES_DIR } from "../../lib/profiles-dir";

export default function handler(req, res) {
  try {
    const files = fs.readdirSync(PROFILES_DIR);

    const profiles = files
      .filter((file) => file.endsWith(".json") && file !== "_template.json")
      .map((file) => ({
        id: file.replace(".json", ""),
        name: file.replace(".json", "").replace(/_/g, " "),
      }));

    res.status(200).json(profiles);
  } catch (error) {
    console.error("Error reading profiles:", error);
    res.status(500).json({ error: "Failed to load profiles" });
  }
}
