/**
 * Data model — field ownership across the pipeline.
 *
 * profiles/_template.json (profile base)
 *   Contact: name, email, workEmail, phone, location, address, postalCode,
 *            linkedin, website, portfolio, github
 *   experience[]: company, title, location, start_date, end_date (no details)
 *   education[]: degree, school, start_year, end_year
 *   screening: { languages, notes, certifications, workAuthorization, ... }
 *
 * profiles/_tailored-resume-template.json (GPT OUTPUT / Step 1 paste)
 *   title, summary, skills, experience[]: { details[] } (+ optional title per role)
 *
 * Merged (profile + tailored) → PDF + Step 3 second prompts
 *   Profile contact + education + screening + work history metadata
 *   + tailored title, summary, skills, experience[].details
 */

/** Most recent role title from profile work history (hint for OUTPUT `title`). */
export function getRecentRoleTitle(profile) {
  const first = profile?.experience?.[0];
  const t = first?.title;
  return t && String(t).trim() ? String(t).trim() : "";
}

/** Format profile.screening object for ATS INPUT / review. */
export function formatScreeningContext(profile) {
  const screening = profile?.screening;
  if (!screening || typeof screening !== "object") return "(none)";
  return Object.entries(screening)
    .map(([key, value]) => {
      if (value == null || value === "") return null;
      if (Array.isArray(value)) return `- ${key}: ${value.join(", ")}`;
      if (typeof value === "object") return `- ${key}: ${JSON.stringify(value)}`;
      return `- ${key}: ${value}`;
    })
    .filter(Boolean)
    .join("\n");
}
