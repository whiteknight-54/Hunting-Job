/** Application workflows — file-based profiles, Next.js API routes only. */

export const WORKFLOW = Object.freeze({
  AUTO: "auto",
  MANUAL: "manual",
});

export const API_ROUTES = Object.freeze({
  GENERATE_AUTO: "/api/generate",
  MANUAL_PROMPT: "/api/manual_prompt",
  MANUAL_GENERATE: "/api/manual_generate",
  MANUAL_PREVIEW: "/api/manual_preview",
  MANUAL_SECOND_PROMPT: "/api/manual_second_prompt",
  CONFIG: "/api/config",
  TEMPLATES: "/api/templates",
  ATS_PROMPTS: "/api/ats-prompts",
  SECOND_PROMPTS: "/api/second-prompts",
  profileByBasename: (basename) => `/api/profiles/${encodeURIComponent(basename)}`,
});
