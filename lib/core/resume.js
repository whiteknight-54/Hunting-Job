export class TailoredResumeError extends Error {
  constructor(message, issues = []) {
    super(message);
    this.name = "TailoredResumeError";
    this.issues = issues;
    this.statusCode = 400;
  }
}

function stripMarkdownFences(text) {
  const trimmed = String(text || "").trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/i);
  return fenced ? fenced[1].trim() : trimmed;
}

export function parseTailoredJson(raw) {
  const text = stripMarkdownFences(raw);
  if (!text) throw new TailoredResumeError("Empty JSON input");
  try {
    return JSON.parse(text);
  } catch {
    throw new TailoredResumeError("Response is not valid JSON");
  }
}

export function tryParseTailoredJson(raw) {
  try {
    return parseTailoredJson(raw);
  } catch {
    return null;
  }
}

/** Parse + schema check. Empty input is ok (sample preview). */
export function validateTailoredJsonInput(raw, profileExperienceCount = 0) {
  const trimmed = String(raw || "").trim();
  if (!trimmed) return { ok: true, empty: true, data: null };
  try {
    const data = assertTailoredResume(parseTailoredJson(raw), profileExperienceCount);
    return { ok: true, empty: false, data };
  } catch (err) {
    if (err instanceof TailoredResumeError) {
      return {
        ok: false,
        empty: false,
        message: err.message,
        issues: err.issues || [],
      };
    }
    throw err;
  }
}

export function isTailoredResumeError(err) {
  return err instanceof TailoredResumeError || err?.name === "TailoredResumeError";
}

export function formatTailoredJsonIssues(result) {
  if (!result || result.ok) return null;
  const parts = [result.message, ...(result.issues || [])].filter(Boolean);
  return parts.length ? parts.join("; ") : "Invalid tailored resume JSON";
}

export function assertTailoredResume(tailored, profileExperienceCount) {
  const issues = [];
  if (!tailored || typeof tailored !== "object") {
    throw new TailoredResumeError("Tailored resume must be a JSON object");
  }
  if (!String(tailored.title || "").trim()) issues.push("title is required");
  if (!String(tailored.summary || "").trim()) issues.push("summary is required");

  const skills = tailored.skills;
  if (!skills || typeof skills !== "object" || Array.isArray(skills)) {
    issues.push("skills must be an object");
  } else {
    const cats = Object.entries(skills).filter(
      ([, v]) => Array.isArray(v) && v.some((s) => String(s).trim())
    );
    if (!cats.length) issues.push("skills needs at least one non-empty category");
  }

  const exp = tailored.experience;
  if (!Array.isArray(exp) || !exp.length) {
    issues.push("experience must be a non-empty array");
  } else if (profileExperienceCount > 0 && exp.length !== profileExperienceCount) {
    issues.push(
      `experience length (${exp.length}) must match profile jobs (${profileExperienceCount})`
    );
  } else {
    exp.forEach((entry, i) => {
      const details = entry?.details;
      if (!Array.isArray(details) || !details.some((d) => String(d).trim())) {
        issues.push(`experience[${i}].details must be a non-empty string array`);
      }
    });
  }

  if (issues.length) throw new TailoredResumeError("Invalid tailored resume JSON", issues);
  return tailored;
}

/** Profile metadata + tailored headline/bullets — index-aligned by job order. */
export function mergeForPdf(profile, tailored, options = {}) {
  const { showPhone = false, showLinkedin = true } = options;
  const profileJobs = profile?.experience || [];
  const tailoredJobs = tailored?.experience || [];

  const experience = profileJobs.map((job, i) => ({
    company: job.company,
    title: tailoredJobs[i]?.title || job.title,
    location: job.location,
    start_date: job.start_date,
    end_date: job.end_date,
    details: (tailoredJobs[i]?.details || []).map((d) => String(d).trim()).filter(Boolean),
  }));

  return {
    name: profile?.name,
    email: profile?.email,
    phone: showPhone ? profile?.phone : null,
    location: profile?.location,
    linkedin: showLinkedin ? profile?.linkedin : null,
    website: profile?.website || profile?.portfolio,
    title: tailored?.title,
    summary: tailored?.summary,
    skills: tailored?.skills,
    experience,
    education: profile?.education || [],
  };
}
