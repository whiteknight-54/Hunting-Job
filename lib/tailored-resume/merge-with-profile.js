/**
 * Merge profile JSON (base) + tailored resume output (role-specific fields from AI/GPT).
 */
export function mergeProfileWithTailoredResume(profileData, tailoredResume) {
  const base = profileData && typeof profileData === "object" ? { ...profileData } : {};
  if (!tailoredResume || typeof tailoredResume !== "object") return base;

  const profileJobs = Array.isArray(base.experience) ? base.experience : [];
  const resumeJobs = Array.isArray(tailoredResume.experience) ? tailoredResume.experience : [];

  const mergedExperience = profileJobs.map((job, idx) => {
    const tailored = resumeJobs[idx] || {};
    return {
      ...job,
      title: tailored.title || job?.title,
      details: tailored.details ?? job?.details ?? [],
    };
  });

  for (let i = profileJobs.length; i < resumeJobs.length; i++) {
    mergedExperience.push(resumeJobs[i]);
  }

  return {
    ...base,
    title: tailoredResume.title,
    summary: tailoredResume.summary,
    skills: tailoredResume.skills,
    experience: mergedExperience,
  };
}

/** @deprecated Use mergeProfileWithTailoredResume */
export const mergeProfileWithResumeOutput = mergeProfileWithTailoredResume;
