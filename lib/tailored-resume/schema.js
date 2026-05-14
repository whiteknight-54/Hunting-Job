/**
 * Canonical shape for AI/GPT tailored resume JSON (profile supplies contact + employers).
 * For full INPUT / GLOSSARY / OUTPUT prompt text, see ./ats-prompt-blocks.js.
 */
export const TAILORED_RESUME_ROOT_KEYS = ["title", "summary", "skills", "experience"];

export const RESUME_OUTPUT_SCHEMA_APPENDIX = `
**STRICT TAILORED RESUME JSON (enforced server-side before PDF generation):**
{
  "title": "string (non-empty, pipe-separated headline)",
  "summary": "string (non-empty paragraph)",
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
- Root keys ONLY: title, summary, skills, experience.
- skills: object with ≥1 category key; each value = non-empty string array.
- experience: non-empty array; length should match profile experience[] when provided.
- experience[i].details: non-empty string array (plain strings, not objects).
- Do NOT include company, location, start_date, or end_date in experience output.
`.trim();

export const TAILORED_RESUME_JSON_EXAMPLE = {
  title: "Senior Software Engineer | React | TypeScript | Node.js | AWS",
  summary: "Senior engineer with 8+ years building scalable web platforms...",
  skills: {
    Frontend: ["React.js", "TypeScript", "Next.js"],
    Backend: ["Node.js", "PostgreSQL", "GraphQL"],
  },
  experience: [
    {
      details: [
        "Architected microservices platform serving millions of users with high availability.",
        "Led migration to cloud infrastructure improving deployment velocity and reliability.",
      ],
    },
  ],
};
