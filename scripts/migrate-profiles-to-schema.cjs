/**
 * Align profiles/*.json with profiles/_template.json:
 * - missing contact keys (workEmail, address, portfolio) → ""
 * - screening merged with template defaults (existing values win)
 * - named candidate files (First_Last.json, not profile-*, temp): root `title`
 *   from experience[0].title when title is missing (matches getProfileLastTitle)
 * Skips _template.json and _tailored-resume-template.json.
 *
 * Usage:
 *   node scripts/migrate-profiles-to-schema.cjs           # all profiles
 *   node scripts/migrate-profiles-to-schema.cjs --named-only
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PROFILES_DIR = path.join(ROOT, "profiles");
const TEMPLATE_PATH = path.join(PROFILES_DIR, "_template.json");

const SKIP = new Set(["_template.json", "_tailored-resume-template.json"]);

/** e.g. Arvin_Bautista.json, Artur_LIS.json — not profile-1, temp, _foo */
function isNamedCandidateFile(file) {
  if (file.startsWith("_")) return false;
  if (/^profile-\d+\.json$/i.test(file)) return false;
  if (file.toLowerCase() === "temp.json") return false;
  if (!file.includes("_")) return false;
  return true;
}

function mergeScreening(existing, defaults) {
  const ex =
    existing && typeof existing === "object" && !Array.isArray(existing) ? existing : {};
  return {
    ...defaults,
    ...ex,
    customAnswers: {
      ...defaults.customAnswers,
      ...(ex.customAnswers && typeof ex.customAnswers === "object" ? ex.customAnswers : {}),
    },
  };
}

function migrateProfile(profile, screeningDefaults, options = {}) {
  const { inferTitleFromExperience = false } = options;
  const p = profile && typeof profile === "object" && !Array.isArray(profile) ? profile : {};
  const out = {};

  out.name = p.name;
  let title = p.title !== undefined ? String(p.title).trim() : "";
  if (!title && inferTitleFromExperience && p.experience?.[0]?.title) {
    title = String(p.experience[0].title).trim();
  }
  if (title) {
    out.title = title;
  }
  out.email = p.email;
  out.workEmail = p.workEmail !== undefined ? p.workEmail : "";
  out.phone = p.phone !== undefined ? p.phone : "";
  out.location = p.location !== undefined ? p.location : "";
  out.address = p.address !== undefined ? p.address : "";
  out.postalCode = p.postalCode !== undefined ? p.postalCode : "";
  out.linkedin = p.linkedin !== undefined ? p.linkedin : "";
  out.website = p.website !== undefined ? p.website : "";
  out.portfolio = p.portfolio !== undefined ? p.portfolio : "";
  out.github = p.github !== undefined ? p.github : "";

  out.experience = Array.isArray(p.experience) ? p.experience : [];
  out.education = Array.isArray(p.education) ? p.education : [];

  out.screening = mergeScreening(p.screening, screeningDefaults);

  return out;
}

function main() {
  const namedOnly = process.argv.includes("--named-only");
  const template = JSON.parse(fs.readFileSync(TEMPLATE_PATH, "utf8"));
  const screeningDefaults = template.screening;
  if (!screeningDefaults || typeof screeningDefaults !== "object") {
    throw new Error("_template.json missing screening object");
  }

  const files = fs.readdirSync(PROFILES_DIR).filter((f) => f.endsWith(".json"));
  let updated = 0;
  let unchanged = 0;
  let skipped = 0;

  for (const file of files) {
    if (SKIP.has(file)) continue;
    if (namedOnly && !isNamedCandidateFile(file)) {
      skipped += 1;
      continue;
    }

    const filePath = path.join(PROFILES_DIR, file);
    const raw = fs.readFileSync(filePath, "utf8");
    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      console.error(`Skip invalid JSON: ${file}`, e.message);
      continue;
    }

    const inferTitle = isNamedCandidateFile(file);
    const migrated = migrateProfile(data, screeningDefaults, {
      inferTitleFromExperience: inferTitle,
    });
    const next = `${JSON.stringify(migrated, null, 2)}\n`;
    if (next === raw || next === `${raw}\n`) {
      unchanged += 1;
      continue;
    }
    fs.writeFileSync(filePath, next, "utf8");
    updated += 1;
    console.log(`Updated ${file}`);
  }

  const parts = [`Updated: ${updated}`, `unchanged: ${unchanged}`];
  if (namedOnly) parts.push(`skipped (not named file): ${skipped}`);
  console.log(`Done. ${parts.join(", ")}`);
}

main();
