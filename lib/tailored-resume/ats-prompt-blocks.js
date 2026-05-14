/**
 * Standard INPUT / GLOSSARY / OUTPUT blocks injected into every ATS prompt template.
 * Aligned with profiles/_template.json and profiles/_tailored-resume-template.json.
 */

export const ATS_PROMPT_GLOSSARY_BLOCK = `
====================================================
FIELD GLOSSARY (use these words consistently)
====================================================

**Profile base** (INPUT — profiles/_template.json; never copy into tailored resume OUTPUT):
- Contact: \`name\`, \`email\`, \`workEmail\`, \`phone\`, \`location\`, \`address\`, \`postalCode\`, \`linkedin\`, \`website\`, \`portfolio\`, \`github\`
- \`experience[]\`: \`company\`, \`title\`, \`location\`, \`start_date\`, \`end_date\` only (no \`details\` on profile)
- \`education[]\`: \`degree\`, \`school\`, \`start_year\`, \`end_year\`
- \`screening\`: nested object (languages, notes, certifications, workAuthorization, etc.)
- {{recentRoleTitle}} = most recent profile \`experience[0].title\` (hint only; OUTPUT \`title\` is job-tailored)

**Tailored resume JSON** (your OUTPUT — profiles/_tailored-resume-template.json):
- Root keys ONLY: \`title\`, \`summary\`, \`skills\`, \`experience\`
- \`experience[]\`: \`details\` required; \`title\` optional per role
- Forbidden in \`experience[]\`: \`company\`, \`location\`, \`start_date\`, \`end_date\`

**Merged resume** (server-side only — PDF + Step 3 prompts):
- Profile contact + \`education\` + \`screening\` + employer fields per job
- Tailored \`title\`, \`summary\`, \`skills\`, and each \`experience[i].details\`

**Terms:**
- **work history** = profile \`experience[]\` in INPUT (company | title | location | dates)
- **job context** = job description + optional application questions
- **detail strings** = strings in OUTPUT \`experience[i].details\`
`.trim();

export const ATS_PROMPT_INPUT_BLOCK = `
====================================================
INPUT (profile base — do not copy into tailored resume JSON)
====================================================

You write the **tailored resume** layer only. Employer metadata is merged server-side for PDF and screening prompts.

Candidate \`name\`: {{name}}
Contact: {{email}} | {{location}}
Years of experience (from profile \`start_date\` values): {{yearsOfExperience}}
Most recent role title (hint for OUTPUT \`title\` — tailor to job context): {{recentRoleTitle}}
Required OUTPUT \`experience\` length: {{experienceCount}} (one object per profile job below, same order)

WORK HISTORY (profile \`experience[]\` — company | title | location | start_date - end_date):
{{workHistory}}

EDUCATION (profile \`education[]\`):
{{education}}

SCREENING DEFAULTS (profile \`screening\` object — reference only):
{{screeningContext}}

JOB CONTEXT (job description + optional application questions):
{{jobDescription}}
`.trim();

export const ATS_PROMPT_OUTPUT_BLOCK = `
====================================================
OUTPUT (tailored resume JSON — REQUIRED SHAPE)
====================================================

Return **ONLY** one valid JSON object. No markdown fences, no preamble.
Root keys ONLY: \`title\`, \`summary\`, \`skills\`, \`experience\`.

Shape (see profiles/_tailored-resume-template.json):
{
  "title": "pipe-separated headline tailored to job context",
  "summary": "paragraph tailored to job context",
  "skills": {
    "CategoryName": ["Skill1", "Skill2"]
  },
  "experience": [
    {
      "details": ["Detail string 1", "Detail string 2"]
    }
  ]
}

Rules:
- Exactly {{experienceCount}} \`experience\` objects (same order as INPUT work history).
- Each object MUST have non-empty \`details\` string array. \`title\` per role is optional.
- Do NOT include \`company\`, \`location\`, \`start_date\`, \`end_date\` in \`experience\`.
- Do NOT include \`name\`, \`email\`, \`education\`, or \`screening\` in OUTPUT.

Example:
{
  "title": "Senior Software Engineer | React | TypeScript | Node.js | AWS",
  "summary": "Senior engineer with deep experience building scalable platforms...",
  "skills": {
    "Frontend": ["React.js", "TypeScript"],
    "Backend": ["Node.js", "PostgreSQL"]
  },
  "experience": [
    {
      "details": [
        "Architected services aligned to job context using stated technologies.",
        "Improved reliability and delivery through modern engineering practices."
      ]
    }
  ]
}
`.trim();
