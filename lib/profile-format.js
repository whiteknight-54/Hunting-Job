import { mergeProfileWithTailoredResume } from "./tailored-resume/merge-with-profile";
import { formatScreeningContext } from "./data-model";

/** Profile base keys (profiles/_template.json). */
const PROFILE_BASE_KEYS = new Set([
  "name",
  "email",
  "workEmail",
  "phone",
  "location",
  "address",
  "postalCode",
  "linkedin",
  "github",
  "website",
  "portfolio",
  "experience",
  "education",
  "screening",
]);

/** Tailored / merged-only keys (not on profile template). */
const TAILORED_KEYS = new Set(["title", "summary", "skills"]);

const section = (title, lines) => {
  const body = lines.filter((l) => l != null && String(l).trim() !== "").join("\n");
  if (!body) return "";
  return `=== ${title} ===\n${body}`;
};

const formatExperience = (experience, { includeDetails = false } = {}) => {
  if (!Array.isArray(experience) || !experience.length) return "(none)";
  return experience
    .map((job, i) => {
      const head = [
        `${i + 1}. ${job?.company || "—"}`,
        job?.title,
        job?.location,
        `${job?.start_date || "?"} – ${job?.end_date || "?"}`,
      ]
        .filter(Boolean)
        .join(" | ");
      if (!includeDetails) return head;
      const details = Array.isArray(job?.details)
        ? job.details.map((d) => `   • ${d}`).join("\n")
        : "";
      return [head, details].filter(Boolean).join("\n");
    })
    .join("\n\n");
};

const formatEducation = (education) => {
  if (!Array.isArray(education) || !education.length) return "(none)";
  return education
    .map((edu, i) => {
      const line = `${i + 1}. ${edu?.degree || "—"} — ${edu?.school || "—"} (${edu?.start_year || ""}–${edu?.end_year || ""})`;
      return edu?.grade ? `${line} | GPA: ${edu.grade}` : line;
    })
    .join("\n");
};

const formatSkills = (skills) => {
  if (!skills || typeof skills !== "object") return "";
  return Object.entries(skills)
    .map(([cat, items]) => `- ${cat}: ${Array.isArray(items) ? items.join(", ") : items}`)
    .join("\n");
};

const formatContact = (profile) =>
  section("CONTACT", [
    profile.name && `Name: ${profile.name}`,
    profile.email && `Email: ${profile.email}`,
    profile.workEmail && `Work email: ${profile.workEmail}`,
    profile.phone && `Phone: ${profile.phone}`,
    profile.location && `Location: ${profile.location}`,
    profile.address && `Address: ${profile.address}`,
    profile.postalCode && `Postal: ${profile.postalCode}`,
    profile.linkedin && `LinkedIn: ${profile.linkedin}`,
    profile.github && `GitHub: ${profile.github}`,
    profile.website && `Website: ${profile.website}`,
    profile.portfolio && `Portfolio: ${profile.portfolio}`,
  ]);

const formatAdditionalFields = (profile, knownKeys) => {
  const additionalKeys = Object.keys(profile).filter((k) => !knownKeys.has(k));
  if (!additionalKeys.length) return "";
  return section(
    "ADDITIONAL FIELDS",
    additionalKeys.map((k) => `${k}:\n${JSON.stringify(profile[k], null, 2)}`)
  );
};

/**
 * Profile base only (profiles/_template.json) — manual Step 1 review panel.
 */
export const formatProfileForReview = (profile) => {
  if (!profile || typeof profile !== "object") return "";

  const experience = section("WORK HISTORY", [formatExperience(profile.experience, { includeDetails: false })]);
  const education = section("EDUCATION", [formatEducation(profile.education)]);
  const screening = profile.screening
    ? section("SCREENING", [formatScreeningContext(profile) || "(none)"])
    : "";
  const additional = formatAdditionalFields(profile, PROFILE_BASE_KEYS);

  return [formatContact(profile), experience, education, screening, additional].filter(Boolean).join("\n\n");
};

/**
 * Merged resume (profile + tailored JSON) — Step 3 second prompts via {{tailoredResumeContext}}.
 */
export const formatMergedResumeForPrompt = (merged) => {
  if (!merged || typeof merged !== "object") return "";

  const headline = section("HEADLINE", [merged.title, merged.summary].filter(Boolean));
  const skills = merged.skills ? section("SKILLS", [formatSkills(merged.skills)]) : "";
  const experience = section("EXPERIENCE", [formatExperience(merged.experience, { includeDetails: true })]);
  const education = section("EDUCATION", [formatEducation(merged.education)]);
  const screening = merged.screening
    ? section("SCREENING", [formatScreeningContext(merged) || "(none)"])
    : "";
  const known = new Set([...PROFILE_BASE_KEYS, ...TAILORED_KEYS]);
  const additional = formatAdditionalFields(merged, known);

  return [formatContact(merged), headline, skills, experience, education, screening, additional]
    .filter(Boolean)
    .join("\n\n");
};

export const profileToPrettyJson = (profile) => JSON.stringify(profile ?? {}, null, 2);

/** Parsed view for Step 3: merged profile + tailored resume output. */
export const formatTailoredResumeContext = (profileData, resumeContent) =>
  formatMergedResumeForPrompt(mergeProfileWithTailoredResume(profileData, resumeContent));

export const tailoredResumeToPrettyJson = (profileData, resumeContent) =>
  JSON.stringify(mergeProfileWithTailoredResume(profileData, resumeContent), null, 2);
