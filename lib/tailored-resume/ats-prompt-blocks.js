/**
 * Composed ATS prompt blocks — built per profile + job context (not static concatenation).
 * GLOSSARY + OUTPUT own the strict JSON contract; INPUT owns career + JD facts.
 */
import {
  RESUME_OUTPUT_SCHEMA_APPENDIX,
  TAILORED_RESUME_ROOT_KEYS,
} from "./schema.js";

/**
 * @param {Record<string, string | number>} vars — from buildAtsSubstitutionVariables
 */
export function buildAtsInputBlock(vars) {
  return `
====================================================
INPUT — CANDIDATE & JOB CONTEXT
====================================================

You write the **tailored resume JSON layer only**. Contact, employers, dates, education, and screening
metadata are merged server-side for PDF generation and downstream screening prompts.

--- Identity ---
Candidate name: ${vars.name}
Contact: ${vars.email} | ${vars.location}
Years of experience (from profile start dates): ${vars.yearsOfExperience}
Most recent role title (OUTPUT title anchor): ${vars.recentRoleTitle}
Required OUTPUT experience[] length: ${vars.experienceCount} (one object per role below, same order)

--- Work history (profile experience[] — metadata only; do NOT copy into OUTPUT) ---
${vars.workHistory}

--- Education (reference only) ---
${vars.education}

--- Screening defaults (reference only — never copy verbatim into OUTPUT) ---
${vars.screeningContext}

--- Job context (primary tailoring target) ---
${vars.jobDescription}
`.trim();
}

/**
 * Strict data contract between INPUT facts and OUTPUT JSON.
 * Field-name references stay literal — career values live in INPUT, not here.
 */
export function buildAtsGlossaryBlock(vars) {
  return `
====================================================
FIELD GLOSSARY & DATA CONTRACT
====================================================

**Three layers (do not mix):**

1. **Profile base** (INPUT above — never emit in OUTPUT)
   - Contact: name, email, workEmail, phone, location, address, postalCode, linkedin, website, portfolio, github
   - experience[]: company, title, location, start_date, end_date only (no details on profile)
   - education[]: degree, school, start_year, end_year
   - screening: languages, notes, certifications, workAuthorization, etc.

2. **Tailored resume JSON** (your ONLY output — see OUTPUT block)
   - Root keys ONLY: ${TAILORED_RESUME_ROOT_KEYS.join(", ")}
   - experience[]: details required (string array); title optional per role
   - FORBIDDEN in experience[]: company, location, start_date, end_date

3. **Merged resume** (server-side — PDF + second prompts)
   - Profile contact + education + screening + employer fields per job
   - Plus tailored title, summary, skills, and each experience[i].details

**Mapping rule:** OUTPUT experience[i] ↔ INPUT work-history role ${vars.experienceCount ? `1..${vars.experienceCount}` : "N"} (same index, most recent first).

**Terms:**
- work history = INPUT experience[] rows (company | title | location | dates) — anchor all experience[].details to this
- job context = job description + optional application questions in INPUT
- detail strings = plain-text bullets in OUTPUT experience[i].details

**Seniority arc for this candidate:** ${vars.seniorityArc}
`.trim();
}

/**
 * @param {Record<string, string | number>} vars
 */
export function buildAtsOutputBlock(vars) {
  const exampleExperience = Array.from({ length: Number(vars.experienceCount) || 1 }, (_, i) => ({
    details: [
      i === 0
        ? "Architected and delivered systems aligned to job context using stated technologies with improved reliability and maintainability."
        : "Built and maintained production features using era-appropriate stacks while collaborating across engineering and product teams.",
    ],
  }));

  const exampleJson = {
    title: `${vars.recentRoleTitle || "Professional"} | KeyTech1 | KeyTech2 | KeyTech3`,
    summary:
      "Senior professional paragraph tailored to job context and work history. Qualitative outcomes only unless QA/ML exceptions apply.",
    skills: {
      Frontend: ["React.js", "TypeScript"],
      Backend: ["Node.js", "PostgreSQL"],
      "Cloud & Infrastructure": ["AWS", "Docker", "CI/CD"],
    },
    experience: exampleExperience,
  };

  return `
====================================================
OUTPUT — STRICT TAILORED RESUME JSON
====================================================

Return **ONLY** one valid JSON object. No markdown fences, no preamble, no commentary.

${RESUME_OUTPUT_SCHEMA_APPENDIX}

**Hard constraints for this request:**
- Root keys ONLY: ${TAILORED_RESUME_ROOT_KEYS.join(", ")}.
- Exactly ${vars.experienceCount} experience objects — same order as INPUT work history.
- Each experience[i].details: non-empty string array; optional experience[i].title allowed.
- skills: object with ≥1 category; each value = non-empty string array; no soft skills; no duplicates.
- title: non-empty pipe-separated headline anchored to recent role (${vars.recentRoleTitle}) and job-context tech.
- summary: non-empty paragraph (5–6 sentences for senior variants).
- Plain strings only in details — no HTML, no nested objects in details arrays.

**Example shape (${vars.experienceCount} experience entries):**
${JSON.stringify(exampleJson, null, 2)}
`.trim();
}

/** @deprecated use buildAtsInputBlock — kept for tests migrating off static blocks */
export const ATS_PROMPT_INPUT_BLOCK = buildAtsInputBlock({
  name: "{{name}}",
  email: "{{email}}",
  location: "{{location}}",
  yearsOfExperience: "{{yearsOfExperience}}",
  recentRoleTitle: "{{recentRoleTitle}}",
  experienceCount: "{{experienceCount}}",
  workHistory: "{{workHistory}}",
  education: "{{education}}",
  screeningContext: "{{screeningContext}}",
  jobDescription: "{{jobDescription}}",
});

/** @deprecated use buildAtsGlossaryBlock */
export const ATS_PROMPT_GLOSSARY_BLOCK = buildAtsGlossaryBlock({
  experienceCount: "{{experienceCount}}",
  seniorityArc: "{{seniorityArc}}",
});

/** @deprecated use buildAtsOutputBlock */
export const ATS_PROMPT_OUTPUT_BLOCK = buildAtsOutputBlock({
  experienceCount: "{{experienceCount}}",
  recentRoleTitle: "{{recentRoleTitle}}",
});
