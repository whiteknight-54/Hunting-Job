import path from "path";
import { promises as fsPromises } from "fs";
import { getProfileBySlug } from "../../lib/profile-template-mapping";
import { readSecondPromptTemplate, applyTemplateVariables } from "../../lib/second-prompts-registry";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  try {
    const {
      profile: profileSlug,
      secondPromptId,
      jd,
      roleTitle,
      companyName = "",
      questions = "",
      resumeOutputJson = "",
    } = req.body || {};

    if (!profileSlug) return res.status(400).json({ error: "Profile slug required" });
    if (!secondPromptId) return res.status(400).json({ error: "secondPromptId required" });
    if (!jd || !String(jd).trim()) return res.status(400).json({ error: "Job description required" });
    if (!roleTitle || !String(roleTitle).trim()) return res.status(400).json({ error: "Role title required" });
    if (!companyName || !String(companyName).trim()) return res.status(400).json({ error: "Company name required" });

    const profileConfig = getProfileBySlug(profileSlug);
    if (!profileConfig) {
      return res.status(404).json({ error: `Profile with slug "${profileSlug}" not found` });
    }

    const profilePath = path.join(process.cwd(), "resumes", `${profileConfig.resume}.json`);
    const profileContent = await fsPromises.readFile(profilePath, "utf-8");
    const profileData = JSON.parse(profileContent);

    const template = await readSecondPromptTemplate(String(secondPromptId));

    let resumeBlock = String(resumeOutputJson || "").trim();
    if (!resumeBlock) resumeBlock = "{}";

    const variables = {
      jobDescription: String(jd || ""),
      roleTitle: String(roleTitle || "").trim(),
      companyName: String(companyName || "").trim(),
      questions: String(questions || ""),
      profileJson: JSON.stringify(profileData, null, 2),
      resumeOutputJson: resumeBlock,
    };

    const prompt = applyTemplateVariables(template, variables);
    return res.status(200).json({ prompt });
  } catch (err) {
    console.error("manual_second_prompt error:", err);
    return res.status(500).json({
      error: "Failed to build second prompt",
      message: err?.message || "Unknown error",
    });
  }
}
