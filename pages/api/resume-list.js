import fs from "fs";
import { PROFILES_DIR } from "../../lib/profiles-dir";

export default function handler(req, res) {
  const files = fs.readdirSync(PROFILES_DIR).filter((f) => f.endsWith(".json"));
  const names = files.map((f) => f.replace(".json", ""));
  res.status(200).json(names);
}
