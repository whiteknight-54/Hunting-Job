/**
 * Merge profile JSON + ChatGPT resume output into React-PDF template data.
 */
export const buildTemplateDataFromProfileAndResume = (profileData, resumeContent) => ({
  name: profileData.name || "Unknown",
  title: resumeContent.title || profileData.title || "Senior Software Engineer",
  email: profileData.email || "",
  phone: null,
  location: profileData.location || "",
  linkedin: null,
  website: null,
  summary: resumeContent.summary || "",
  skills: resumeContent.skills || {},
  experience: (profileData.experience || []).map((job, idx) => ({
    title: job?.title || resumeContent.experience?.[idx]?.title || "Engineer",
    company: job?.company || "Unknown Company",
    location: job?.location || "",
    start_date: job?.start_date || "",
    end_date: job?.end_date || "",
    details: resumeContent.experience?.[idx]?.details || [],
  })),
  education: profileData.education || [],
});
