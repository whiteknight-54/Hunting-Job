import { mergeProfileWithTailoredResume } from "./tailored-resume/merge-with-profile";

/** Known top-level keys rendered in structured sections; anything else is listed under Additional. */
const CORE_KEYS = new Set([
  "name",
  "title",
  "email",
  "phone",
  "location",
  "postalCode",
  "linkedin",
  "github",
  "website",
  "experience",
  "education",
  "certifications",
  "languages",
  "skills",
  "projects",
  "screening",
  "notes",
  "summary",
]);

const section = (title, lines) => {
  const body = lines.filter((l) => l != null && String(l).trim() !== "").join("\n");
  if (!body) return "";
  return `=== ${title} ===\n${body}`;
};

const formatExperience = (experience) => {
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
      const details = Array.isArray(job?.details)
        ? job.details.map((d) => `   • ${d}`).join("\n")
        : job?.details
          ? `   • ${job.details}`
          : "";
      const extra = job?.highlights ? `   Highlights: ${job.highlights}` : "";
      return [head, details, extra].filter(Boolean).join("\n");
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

const formatListSection = (label, items, formatter) => {
  if (!items) return "";
  if (Array.isArray(items)) {
    if (!items.length) return "";
    return items.map((item, i) => (formatter ? formatter(item, i) : `${i + 1}. ${JSON.stringify(item)}`)).join("\n");
  }
  if (typeof items === "object") {
    return Object.entries(items)
      .map(([k, v]) => `- ${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
      .join("\n");
  }
  return String(items);
};

/**
 * Human-readable profile dump for UI review + optional {{profileContext}} in prompts.
 */
export const formatProfileForReview = (profile) => {
  if (!profile || typeof profile !== "object") return "";

  const contact = section(
    "CONTACT",
    [
      profile.name && `Name: ${profile.name}`,
      profile.title && `Title: ${profile.title}`,
      profile.email && `Email: ${profile.email}`,
      profile.phone && `Phone: ${profile.phone}`,
      profile.location && `Location: ${profile.location}`,
      profile.postalCode && `Postal: ${profile.postalCode}`,
      profile.linkedin && `LinkedIn: ${profile.linkedin}`,
      profile.github && `GitHub: ${profile.github}`,
      profile.website && `Website: ${profile.website}`,
    ]
  );

  const summary = profile.summary ? section("SUMMARY", [profile.summary]) : "";
  const notes = profile.notes ? section("NOTES", [profile.notes]) : "";

  const experience = section("EXPERIENCE", [formatExperience(profile.experience)]);
  const education = section("EDUCATION", [formatEducation(profile.education)]);

  const certifications = profile.certifications?.length
    ? section("CERTIFICATIONS", [formatListSection("cert", profile.certifications, (c, i) => `${i + 1}. ${typeof c === "string" ? c : c?.name || JSON.stringify(c)}`)])
    : "";

  const languages = profile.languages
    ? section("LANGUAGES", [formatListSection("lang", profile.languages)])
    : "";

  const skills = profile.skills
    ? section("SKILLS", [formatListSection("skills", profile.skills)])
    : "";

  const projects = profile.projects?.length
    ? section(
        "PROJECTS",
        profile.projects.map((p, i) => {
          if (typeof p === "string") return `${i + 1}. ${p}`;
          return `${i + 1}. ${p?.name || "Project"}${p?.description ? ` — ${p.description}` : ""}`;
        })
      )
    : "";

  const screening = profile.screening
    ? section("SCREENING / APPLICATION DEFAULTS", [formatListSection("screening", profile.screening)])
    : "";

  const additionalKeys = Object.keys(profile).filter((k) => !CORE_KEYS.has(k));
  const additional =
    additionalKeys.length > 0
      ? section(
          "ADDITIONAL FIELDS (extend profile JSON freely)",
          additionalKeys.map((k) => `${k}:\n${JSON.stringify(profile[k], null, 2)}`)
        )
      : "";

  return [contact, summary, notes, experience, education, certifications, languages, skills, projects, screening, additional]
    .filter(Boolean)
    .join("\n\n");
};

export const profileToPrettyJson = (profile) => JSON.stringify(profile ?? {}, null, 2);

/**
 * Parsed view for 2nd prompts: profile base + tailored resume output merged.
 * Contact/education from profile; title, summary, skills, bullets from resume when present.
 */
export const formatTailoredResumeContext = (profileData, resumeContent) =>
  formatProfileForReview(mergeProfileWithTailoredResume(profileData, resumeContent));

export const tailoredResumeToPrettyJson = (profileData, resumeContent) =>
  JSON.stringify(mergeProfileWithTailoredResume(profileData, resumeContent), null, 2);
