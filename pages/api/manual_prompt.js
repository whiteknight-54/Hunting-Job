import path from "path";
import { promises as fsPromises } from "fs";
import { getProfileBySlug } from "../../lib/profile-template-mapping";

// Cache prompt templates in memory (serverless warm reuse)
const promptCache = new Map();

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  try {
    const { profile: profileSlug, jd } = req.body || {};

    if (!profileSlug) return res.status(400).send("Profile slug required");
    if (!jd) return res.status(400).send("Job description required");

    const profileConfig = getProfileBySlug(profileSlug);
    if (!profileConfig) {
      return res.status(404).send(`Profile with slug "${profileSlug}" not found`);
    }

    // Load the same default prompt used by /api/generate
    const promptCacheKey = `${profileSlug}-default`;
    let promptTemplate;
    if (promptCache.has(promptCacheKey)) {
      promptTemplate = promptCache.get(promptCacheKey);
    } else {
      const defaultPath = path.join(process.cwd(), "lib", "prompts", "default.txt");
      promptTemplate = await fsPromises.readFile(defaultPath, "utf-8");
      promptCache.set(promptCacheKey, promptTemplate);
    }

    // Variables are identical to /api/generate, but the resume/profile data is not required
    // to build the prompt (prompt includes placeholders filled by /api/generate using profile JSON).
    // For manual mode we still want a fully-expanded prompt, so we load profile JSON here.
    const profilePath = path.join(process.cwd(), "resumes", `${profileConfig.resume}.json`);
    const profileContent = await fsPromises.readFile(profilePath, "utf-8");
    const profileData = JSON.parse(profileContent);

    const calculateYears = (experience) => {
      if (!experience || experience.length === 0) return 0;
      const mmYyyyPattern = /^(\d{1,2})\/(\d{4})\s*$/;
      const presentLower = "present";
      const msPerYear = 1000 * 60 * 60 * 24 * 365;

      const parseDate = (dateStr) => {
        if (!dateStr) return null;
        const trimmed = String(dateStr).trim();
        const trimmedLower = trimmed.toLowerCase();
        if (trimmedLower === presentLower) return new Date();
        const mmYyyyMatch = trimmed.match(mmYyyyPattern);
        if (mmYyyyMatch) return new Date(parseInt(mmYyyyMatch[2], 10), parseInt(mmYyyyMatch[1], 10) - 1, 1);
        const parsed = new Date(trimmed);
        if (isNaN(parsed.getTime())) return null;
        return parsed;
      };

      let earliest = null;
      for (const job of experience) {
        const d = parseDate(job?.start_date);
        if (!d) continue;
        if (!earliest || d < earliest) earliest = d;
      }
      if (!earliest) return 0;
      const years = (Date.now() - earliest.getTime()) / msPerYear;
      return Math.max(0, Math.round(years));
    };

    const yearsOfExperience = calculateYears(profileData.experience);
    const experience = profileData.experience || [];
    const workHistoryParts = [];
    for (let idx = 0; idx < experience.length; idx++) {
      const job = experience[idx];
      const parts = [`${idx + 1}. ${job?.company || "Unknown Company"}`];
      if (job?.title) parts.push(job.title);
      if (job?.location) parts.push(job.location);
      parts.push(`${job?.start_date || "N/A"} - ${job?.end_date || "N/A"}`);
      workHistoryParts.push(parts.join(" | "));
    }
    const workHistory = workHistoryParts.join("\n");

    const educationList = profileData.education || [];
    const educationParts = [];
    for (let i = 0; i < educationList.length; i++) {
      const edu = educationList[i];
      let eduStr = `- ${edu?.degree || "N/A"}, ${edu?.school || "N/A"} (${edu?.start_year || ""}-${edu?.end_year || ""})`;
      if (edu?.grade) eduStr += ` | GPA: ${edu.grade}`;
      educationParts.push(eduStr);
    }
    const education = educationParts.join("\n");

    const variables = {
      name: profileData.name || "Unknown",
      email: profileData.email || "",
      location: profileData.location || "",
      yearsOfExperience: yearsOfExperience,
      workHistory: workHistory,
      education: education,
      jobDescription: jd,
      experienceCount: (profileData.experience || []).length,
    };

    const variablePatterns = Object.keys(variables).map((key) => ({
      pattern: new RegExp(`\\{\\{${key}\\}\\}`, "g"),
      value: String(variables[key] || ""),
    }));

    let prompt = promptTemplate;
    for (const { pattern, value } of variablePatterns) {
      prompt = prompt.replace(pattern, value);
    }

    return res.status(200).json({ prompt });
  } catch (err) {
    console.error("Manual prompt error:", err);
    return res.status(500).json({
      error: "Failed to build manual prompt",
      message: err?.message || "Unknown error occurred",
    });
  }
}

