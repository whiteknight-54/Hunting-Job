import { mergeForPdf } from "./core/resume.js";

export function profileToPrettyJson(profile) {
  return JSON.stringify(profile, null, 2);
}

/** Most recent job title: `profile.title` or first `experience[]` entry. */
export function getProfileLastTitle(profile) {
  if (!profile) return null;
  const explicit = profile.title?.trim();
  if (explicit) return explicit;
  const fromExperience = profile.experience?.[0]?.title?.trim();
  return fromExperience || null;
}

function pushContactLines(lines, data) {
  if (data?.name) lines.push(`Name: ${data.name}`);
  if (data?.email) lines.push(`Email: ${data.email}`);
  if (data?.phone) lines.push(`Phone: ${data.phone}`);
  if (data?.location) lines.push(`Location: ${data.location}`);
  if (data?.linkedin) lines.push(`LinkedIn: ${data.linkedin}`);
  if (data?.website) lines.push(`Website: ${data.website}`);
}

function pushScreeningLines(lines, screening) {
  if (!screening || typeof screening !== "object") return;

  lines.push("", "Screening:");
  for (const [key, value] of Object.entries(screening)) {
    if (value == null || value === "") continue;
    if (Array.isArray(value)) {
      if (value.length) lines.push(`${key}: ${value.join(" | ")}`);
      continue;
    }
    if (typeof value === "object") {
      lines.push(`${key}:`);
      for (const [nestedKey, nestedValue] of Object.entries(value)) {
        if (nestedValue == null || String(nestedValue).trim() === "") continue;
        lines.push(`  ${nestedKey}: ${nestedValue}`);
      }
      continue;
    }
    lines.push(`${key}: ${value}`);
  }
}

export function formatProfileForReview(profile) {
  if (!profile) return "";
  const lines = [];
  pushContactLines(lines, profile);
  lines.push("", "Experience:");

  (profile.experience || []).forEach((job, i) => {
    const dates = [job.start_date, job.end_date].filter(Boolean).join(" – ");
    lines.push(
      `${i + 1}. ${job.title || "—"} @ ${job.company || "—"}${dates ? ` (${dates})` : ""}`
    );
  });

  if (profile.education?.length) {
    lines.push("", "Education:");
    profile.education.forEach((edu, i) => {
      lines.push(`${i + 1}. ${edu.degree || "—"} — ${edu.school || "—"}`);
    });
  }

  return lines.join("\n");
}

/** Human-readable resume context for second prompts (profile review style, full content). */
export function formatTailoredResumeContext(profile, tailored) {
  if (!profile && !tailored) return "";

  const data = tailored
    ? mergeForPdf(profile, tailored)
    : {
        name: profile?.name,
        email: profile?.email,
        phone: profile?.phone,
        location: profile?.location,
        linkedin: profile?.linkedin,
        website: profile?.website || profile?.portfolio,
        title: getProfileLastTitle(profile),
        summary: null,
        skills: null,
        experience: (profile?.experience || []).map((job) => ({ ...job, details: [] })),
        education: profile?.education || [],
      };

  const lines = [];
  pushContactLines(lines, data);
  if (data.title) lines.push(`Title: ${data.title}`);

  if (data.summary) {
    lines.push("", "Summary:", String(data.summary).trim());
  }

  if (data.skills && typeof data.skills === "object" && !Array.isArray(data.skills)) {
    lines.push("", "Skills:");
    for (const [category, items] of Object.entries(data.skills)) {
      const list = Array.isArray(items)
        ? items.map((s) => String(s).trim()).filter(Boolean).join(", ")
        : String(items || "").trim();
      if (list) lines.push(`${category}: ${list}`);
    }
  }

  if (data.experience?.length) {
    lines.push("", "Experience:");
    data.experience.forEach((job, i) => {
      const dates = [job.start_date, job.end_date].filter(Boolean).join(" – ");
      const location = job.location ? `, ${job.location}` : "";
      lines.push(
        `${i + 1}. ${job.title || "—"} @ ${job.company || "—"}${location}${dates ? ` (${dates})` : ""}`
      );
      (job.details || []).forEach((detail) => {
        const bullet = String(detail).trim();
        if (bullet) lines.push(`   • ${bullet}`);
      });
    });
  }

  if (data.education?.length) {
    lines.push("", "Education:");
    data.education.forEach((edu, i) => {
      const years = [edu.start_year, edu.end_year].filter(Boolean).join(" – ");
      lines.push(
        `${i + 1}. ${edu.degree || "—"} — ${edu.school || "—"}${years ? ` (${years})` : ""}`
      );
    });
  }

  pushScreeningLines(lines, profile?.screening);

  return lines.join("\n");
}
