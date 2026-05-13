/**
 * Standard INPUT / GLOSSARY / OUTPUT blocks injected into every ATS prompt template.
 * Field names match profiles/_template.json, profiles/_tailored-resume-template.json,
 * lib/tailored-resume/validate.js, and lib/tailored-resume/build-pdf-data.js (PDF template data).
 */

export const ATS_PROMPT_GLOSSARY_BLOCK = `
====================================================
FIELD GLOSSARY (use these words consistently)
====================================================

**Profile base** (INPUT — profiles/*.json; never copy contact or employer fields into OUTPUT):
- Contact: \`name\`, \`email\`, \`phone\`, \`location\`, \`linkedin\`, \`website\`
- \`experience[]\`: \`company\`, \`title\`, \`location\`, \`start_date\`, \`end_date\`, \`details\` (optional source bullets)
- \`education[]\`: \`degree\`, \`school\`, \`start_year\`, \`end_year\`
- Profile headline: profile \`title\` (INPUT shows this as {{resumeTitle}})

**Tailored resume JSON** (your OUTPUT only):
- Root keys ONLY: \`title\`, \`summary\`, \`skills\`, \`experience\`
- \`skills\`: object — category name → string array (e.g. \`"Frontend": ["React.js"]\`)
- \`experience[]\`: \`title\` (optional per role), \`details\` (required string array)
- Forbidden in \`experience[]\`: \`company\`, \`location\`, \`start_date\`, \`end_date\`

**PDF template data** (merged server-side — do not output):
- Profile contact + profile \`experience\` employer metadata + tailored \`title\`, \`summary\`, \`skills\`, and each role's \`details\`

**Terms in these instructions:**
- **work history** = profile \`experience[]\` as shown in INPUT (company | title | location | dates)
- **job context** = INPUT job description + optional application questions (JD shorthand OK)
- **detail strings** = plain-text bullets you write in \`experience[i].details\` (not separate \`bullets\` / \`highlights\` keys)
`.trim();

export const ATS_PROMPT_INPUT_BLOCK = `
====================================================
INPUT (profile base — do not copy into tailored resume JSON)
====================================================

You produce the **tailored resume** layer only. Profile contact, employer names, locations, and
dates are merged server-side into PDF template data. Do NOT repeat \`company\`, \`location\`,
\`start_date\`, or \`end_date\` inside OUTPUT \`experience\` objects.

Candidate \`name\`: {{name}}
Contact: {{email}} | {{location}}
Years of experience (calculated from profile \`start_date\` values): {{yearsOfExperience}}
Profile headline (reference for OUTPUT \`title\` field): {{resumeTitle}}
Required \`experience\` array length: {{experienceCount}} (output exactly this many objects, same order as below)

WORK HISTORY (profile \`experience[]\` — company | title | location | start_date - end_date):
{{workHistory}}

EDUCATION (profile \`education[]\` — reference only):
{{education}}

JOB CONTEXT (job description + optional application questions):
{{jobDescription}}
`.trim();

export const ATS_PROMPT_OUTPUT_BLOCK = `
====================================================
OUTPUT (tailored resume JSON — REQUIRED SHAPE)
====================================================

Return **ONLY** one valid JSON object. No markdown fences, no preamble, no commentary.
Start with \`{\` and end with \`}\`. Root keys ONLY: \`title\`, \`summary\`, \`skills\`, \`experience\`.

{
  "title": "string — non-empty pipe-separated headline (OUTPUT field; see INPUT profile headline)",
  "summary": "string — non-empty paragraph tailored to job context",
  "skills": {
    "CategoryName": ["Skill1", "Skill2"]
  },
  "experience": [
    {
      "title": "string — optional per role; employer metadata stays in profile base",
      "details": ["Detail string 1", "Detail string 2"]
    }
  ]
}

Validation rules (enforced before PDF generation):
- \`skills\`: object with ≥1 category; each category = non-empty array of non-empty strings.
- \`experience\`: array with exactly {{experienceCount}} objects (same order as INPUT work history).
- \`experience[i].details\`: non-empty array of plain strings (not objects, not HTML).
- Forbidden inside \`experience\` objects: \`company\`, \`location\`, \`start_date\`, \`end_date\`, \`bullets\`, \`highlights\`.
- Do not add extra root keys (no \`name\`, \`email\`, \`education\`, \`certifications\` in OUTPUT).

Example (see profiles/_tailored-resume-template.json):
{
  "title": "Senior Software Engineer | React | TypeScript | Node.js",
  "summary": "Senior engineer with deep experience building scalable platforms...",
  "skills": {
    "Frontend": ["React.js", "TypeScript"],
    "Backend": ["Node.js", "PostgreSQL"]
  },
  "experience": [
    {
      "title": "Senior Software Engineer",
      "details": [
        "Architected services aligned to job context using stated technologies.",
        "Improved reliability and delivery through modern engineering practices."
      ]
    }
  ]
}
`.trim();
