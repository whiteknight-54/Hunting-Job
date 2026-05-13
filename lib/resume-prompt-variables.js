/**
 * Shared variable builders for ATS resume prompts (manual + /api/generate).
 */

export const calculateYearsOfExperience = (experience) => {
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

export const buildWorkHistoryText = (experience) => {
  const workHistoryParts = [];
  for (let idx = 0; idx < (experience || []).length; idx++) {
    const job = experience[idx];
    const parts = [`${idx + 1}. ${job?.company || "Unknown Company"}`];
    if (job?.title) parts.push(job.title);
    if (job?.location) parts.push(job.location);
    parts.push(`${job?.start_date || "N/A"} - ${job?.end_date || "N/A"}`);
    workHistoryParts.push(parts.join(" | "));
  }
  return workHistoryParts.join("\n");
};

export const buildEducationText = (educationList) => {
  const educationParts = [];
  for (let i = 0; i < (educationList || []).length; i++) {
    const edu = educationList[i];
    let eduStr = `- ${edu?.degree || "N/A"}, ${edu?.school || "N/A"} (${edu?.start_year || ""}-${edu?.end_year || ""})`;
    if (edu?.grade) eduStr += ` | GPA: ${edu.grade}`;
    educationParts.push(eduStr);
  }
  return educationParts.join("\n");
};

/**
 * Build {{...}} substitution map for ATS prompt templates.
 * Appends role / company / screening questions into the job description context
 * so existing prompt files do not need duplicate placeholders.
 */
export const buildAtsSubstitutionVariables = (profileData, { jobDescription, roleTitle = "", companyName = "", questions = "" }) => {
  const experience = profileData.experience || [];
  const yearsOfExperience = calculateYearsOfExperience(experience);
  const workHistory = buildWorkHistoryText(experience);
  const education = buildEducationText(profileData.education || []);

  const jdParts = [String(jobDescription || "").trim()];
  const rt = String(roleTitle || "").trim();
  const cn = String(companyName || "").trim();
  const q = String(questions || "").trim();
  if (rt) jdParts.push(`Target role: ${rt}`);
  if (cn) jdParts.push(`Company: ${cn}`);
  if (q) jdParts.push(`Employer / application questions:\n${q}`);
  const augmentedJobDescription = jdParts.filter(Boolean).join("\n\n");

  return {
    name: profileData.name || "Unknown",
    email: profileData.email || "",
    location: profileData.location || "",
    yearsOfExperience,
    workHistory,
    education,
    jobDescription: augmentedJobDescription,
    experienceCount: experience.length,
  };
};
