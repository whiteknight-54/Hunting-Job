const PROFILE_OWNED_EXPERIENCE_KEYS = new Set(["company", "location", "start_date", "end_date", "startDate", "endDate"]);

function toBulletString(item) {
  if (item == null) return "";
  if (typeof item === "string") return item.trim();
  if (typeof item === "object") {
    if (typeof item.text === "string") return item.text.trim();
    if (typeof item.bullet === "string") return item.bullet.trim();
    if (typeof item.detail === "string") return item.detail.trim();
    if (typeof item.content === "string") return item.content.trim();
  }
  return String(item).trim();
}

function normalizeSkills(skills) {
  if (!skills) return {};
  if (Array.isArray(skills)) {
    const flat = skills.map((s) => String(s).trim()).filter(Boolean);
    return flat.length ? { General: flat } : {};
  }
  if (typeof skills !== "object") return {};

  const out = {};
  for (const [key, val] of Object.entries(skills)) {
    const category = String(key).trim();
    if (!category) continue;
    if (Array.isArray(val)) {
      const items = val.map((s) => String(s).trim()).filter(Boolean);
      if (items.length) out[category] = items;
    } else if (typeof val === "string" && val.trim()) {
      out[category] = [val.trim()];
    }
  }
  return out;
}

function normalizeExperienceEntry(entry) {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
    return { details: [] };
  }

  const clean = {};
  if (entry.title != null && String(entry.title).trim()) {
    clean.title = String(entry.title).trim();
  }

  let details = entry.details;
  if (details && typeof details === "object" && !Array.isArray(details)) {
    const bullet = toBulletString(details);
    details = bullet ? [bullet] : [];
  }
  if (typeof details === "string") details = [details];
  if (!Array.isArray(details) && entry.bullets) details = entry.bullets;
  if (!Array.isArray(details) && entry.highlights) details = entry.highlights;

  clean.details = Array.isArray(details) ? details.map(toBulletString).filter(Boolean) : [];

  return clean;
}

/** Coerce common AI mistakes into the canonical tailored-resume shape. */
export function normalizeTailoredResumeOutput(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { title: "", summary: "", skills: {}, experience: [] };
  }

  const experience = Array.isArray(raw.experience) ? raw.experience.map(normalizeExperienceEntry) : [];

  return {
    title: String(raw.title ?? "").trim(),
    summary: String(raw.summary ?? "").trim(),
    skills: normalizeSkills(raw.skills),
    experience,
  };
}

export { PROFILE_OWNED_EXPERIENCE_KEYS };
