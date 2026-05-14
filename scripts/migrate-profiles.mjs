/**
 * Align profile JSON files to profiles/_template.json shape.
 * Run: node scripts/migrate-profiles.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const profilesDir = join(__dirname, "..", "profiles");

const CONTACT_KEYS = [
  "name",
  "email",
  "workEmail",
  "phone",
  "location",
  "address",
  "postalCode",
  "linkedin",
  "website",
  "portfolio",
  "github",
];

const LEGACY_ROOT_KEYS = new Set(["title", "summary", "skills", "certifications", "languages", "notes"]);

function stripExperienceDetails(experience) {
  if (!Array.isArray(experience)) return [];
  return experience.map((job) => {
    if (!job || typeof job !== "object") return job;
    const { details, highlights, ...rest } = job;
    return rest;
  });
}

function buildScreening(profile) {
  const screening = profile.screening && typeof profile.screening === "object" ? { ...profile.screening } : {};

  if (Array.isArray(profile.certifications) && profile.certifications.length) {
    screening.certifications = [...(screening.certifications || []), ...profile.certifications];
  }
  if (profile.languages) {
    screening.languages = screening.languages || profile.languages;
  }
  if (profile.notes) {
    screening.notes = screening.notes ? `${screening.notes}\n${profile.notes}` : profile.notes;
  }

  const recentRole = profile.experience?.[0]?.title?.trim();
  const rootTitle = profile.title != null ? String(profile.title).trim() : "";
  if (rootTitle && rootTitle !== recentRole) {
    const hint = `Legacy profile headline: ${rootTitle}`;
    screening.notes = screening.notes ? `${screening.notes}\n${hint}` : hint;
  }

  return {
    languages: Array.isArray(screening.languages) ? screening.languages : [],
    notes: screening.notes || "",
    certifications: Array.isArray(screening.certifications) ? screening.certifications : [],
    workAuthorization: screening.workAuthorization || "",
    salaryExpectation: screening.salaryExpectation || "",
    availability: screening.availability || "",
    relocation: screening.relocation || "",
    customAnswers:
      screening.customAnswers && typeof screening.customAnswers === "object" ? screening.customAnswers : {},
  };
}

function migrateProfile(profile) {
  const migrated = {};

  for (const key of CONTACT_KEYS) {
    if (profile[key] != null && profile[key] !== "") migrated[key] = profile[key];
  }

  migrated.experience = stripExperienceDetails(profile.experience);
  migrated.education = Array.isArray(profile.education) ? profile.education : [];
  migrated.screening = buildScreening(profile);

  const known = new Set([...CONTACT_KEYS, "experience", "education", "screening", ...LEGACY_ROOT_KEYS]);
  for (const key of Object.keys(profile)) {
    if (!known.has(key)) migrated[key] = profile[key];
  }

  return migrated;
}

const skip = new Set(["_template.json", "_tailored-resume-template.json"]);
const files = readdirSync(profilesDir).filter((f) => f.endsWith(".json") && !skip.has(f));

let updated = 0;
for (const file of files) {
  const path = join(profilesDir, file);
  const raw = readFileSync(path, "utf8");
  const profile = JSON.parse(raw);
  const migrated = migrateProfile(profile);
  const out = `${JSON.stringify(migrated, null, 2)}\n`;
  if (out !== raw && out !== raw.replace(/\r\n/g, "\n")) {
    writeFileSync(path, out, "utf8");
    updated++;
    console.log(`[updated] ${file}`);
  } else {
    console.log(`[ok] ${file}`);
  }
}

console.log(`\nDone. ${updated} file(s) updated.`);
