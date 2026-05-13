import path from "path";
import { promises as fsPromises } from "fs";
import { getProfileBySlug, getPromptForProfile } from "../../lib/profile-template-mapping";
import { readAtsPromptTemplate, sanitizeAtsPromptId } from "../../lib/ats-prompts";
import { buildAtsSubstitutionVariables } from "../../lib/resume-prompt-variables";

const promptCache = new Map();

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  try {
    const {
      profile: profileSlug,
      jd,
      atsPrompt: atsPromptOverride,
      roleTitle = "",
      companyName = "",
      questions = "",
    } = req.body || {};

    if (!profileSlug) return res.status(400).send("Profile slug required");
    if (!jd) return res.status(400).send("Job description required");

    const profileConfig = getProfileBySlug(profileSlug);
    if (!profileConfig) {
      return res.status(404).send(`Profile with slug "${profileSlug}" not found`);
    }

    const mappedAts = getPromptForProfile(profileSlug);
    const atsPromptName = sanitizeAtsPromptId(atsPromptOverride || mappedAts);
    const promptCacheKey = `${profileSlug}::${atsPromptName}`;

    let promptTemplate;
    if (promptCache.has(promptCacheKey)) {
      promptTemplate = promptCache.get(promptCacheKey);
    } else {
      promptTemplate = await readAtsPromptTemplate(atsPromptName);
      promptCache.set(promptCacheKey, promptTemplate);
    }

    const profilePath = path.join(process.cwd(), "resumes", `${profileConfig.resume}.json`);
    const profileContent = await fsPromises.readFile(profilePath, "utf-8");
    const profileData = JSON.parse(profileContent);

    const variables = buildAtsSubstitutionVariables(profileData, {
      jobDescription: jd,
      roleTitle,
      companyName,
      questions,
    });

    const variablePatterns = Object.keys(variables).map((key) => ({
      pattern: new RegExp(`\\{\\{${key}\\}\\}`, "g"),
      value: String(variables[key] || ""),
    }));

    let prompt = promptTemplate;
    for (const { pattern, value } of variablePatterns) {
      prompt = prompt.replace(pattern, value);
    }

    return res.status(200).json({ prompt, atsPromptUsed: atsPromptName });
  } catch (err) {
    console.error("Manual prompt error:", err);
    return res.status(500).json({
      error: "Failed to build manual prompt",
      message: err?.message || "Unknown error occurred",
    });
  }
}
