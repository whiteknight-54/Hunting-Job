import { TAILORED_RESUME_ROOT_KEYS } from "./schema.js";

/**
 * Deep validation of normalized tailored resume output.
 * @returns {{ valid: boolean, issues: string[] }}
 */
export function validateTailoredResumeOutput(obj, { expectedExperienceCount = null } = {}) {
  const issues = [];

  if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
    return { valid: false, issues: ["Root must be a JSON object"] };
  }

  const extraKeys = Object.keys(obj).filter((k) => !TAILORED_RESUME_ROOT_KEYS.includes(k));
  if (extraKeys.length) {
    issues.push(`Unexpected root keys: ${extraKeys.join(", ")}`);
  }

  for (const key of TAILORED_RESUME_ROOT_KEYS) {
    if (!(key in obj)) issues.push(`Missing required key: ${key}`);
  }

  if (typeof obj.title !== "string" || !obj.title.trim()) {
    issues.push("title must be a non-empty string");
  }

  if (typeof obj.summary !== "string" || !obj.summary.trim()) {
    issues.push("summary must be a non-empty string");
  }

  if (!obj.skills || typeof obj.skills !== "object" || Array.isArray(obj.skills)) {
    issues.push("skills must be an object mapping category names to string arrays");
  } else {
    const categories = Object.keys(obj.skills);
    if (!categories.length) {
      issues.push("skills must include at least one category");
    }
    for (const cat of categories) {
      const val = obj.skills[cat];
      if (!Array.isArray(val) || !val.length) {
        issues.push(`skills.${cat} must be a non-empty array of strings`);
        continue;
      }
      val.forEach((skill, idx) => {
        if (typeof skill !== "string" || !skill.trim()) {
          issues.push(`skills.${cat}[${idx}] must be a non-empty string`);
        }
      });
    }
  }

  if (!Array.isArray(obj.experience) || !obj.experience.length) {
    issues.push("experience must be a non-empty array");
  } else {
    if (expectedExperienceCount != null && obj.experience.length !== expectedExperienceCount) {
      issues.push(
        `experience must have ${expectedExperienceCount} entries to match profile work history (got ${obj.experience.length})`
      );
    }

    obj.experience.forEach((job, i) => {
      const path = `experience[${i}]`;
      if (!job || typeof job !== "object" || Array.isArray(job)) {
        issues.push(`${path} must be an object`);
        return;
      }

      const foreign = ["company", "location", "start_date", "end_date", "startDate", "endDate"].filter(
        (k) => job[k] != null && String(job[k]).trim() !== ""
      );
      if (foreign.length) {
        issues.push(`${path} must not include profile-owned fields: ${foreign.join(", ")}`);
      }

      if (job.title != null && (typeof job.title !== "string" || !String(job.title).trim())) {
        issues.push(`${path}.title must be a non-empty string when present`);
      }

      if (!Array.isArray(job.details) || !job.details.length) {
        issues.push(`${path}.details must be a non-empty array of strings`);
      } else {
        job.details.forEach((bullet, j) => {
          if (typeof bullet !== "string" || !bullet.trim()) {
            issues.push(`${path}.details[${j}] must be a non-empty string`);
          }
        });
      }
    });
  }

  return { valid: issues.length === 0, issues };
}

/** Fast check used by previews (no deep path messages). */
export function isValidTailoredResumeOutput(obj) {
  return validateTailoredResumeOutput(obj).valid;
}
