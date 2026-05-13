import { mergeProfileWithTailoredResume } from "./merge-with-profile.js";

/** Merge profile + tailored resume into React-PDF template data. */
export function buildTemplateDataFromProfileAndResume(profileData, tailoredResume) {
  const merged = mergeProfileWithTailoredResume(profileData, tailoredResume);
  return {
    name: merged.name || "Unknown",
    title: merged.title || "Senior Software Engineer",
    email: merged.email || "",
    phone: merged.phone || null,
    location: merged.location || "",
    linkedin: merged.linkedin || null,
    website: merged.website || null,
    summary: merged.summary || "",
    skills: merged.skills || {},
    experience: (merged.experience || []).map((job) => ({
      title: job?.title || "Engineer",
      company: job?.company || "Unknown Company",
      location: job?.location || "",
      start_date: job?.start_date || "",
      end_date: job?.end_date || "",
      details: job?.details || [],
    })),
    education: merged.education || [],
  };
}

export { mergeProfileWithTailoredResume, mergeProfileWithResumeOutput } from "./merge-with-profile.js";
