/** Application workflows — file-based profiles, Next.js API routes only. */

/** Max content width for manual/auto profile pages. */
export const PROFILE_PAGE_MAX_WIDTH_PX = 960;

/** Settings popover (⚙) width — shared by manual and auto headers. */
export const SETTINGS_POPOVER_MAX_WIDTH_PX = 364;

/** Vertical gap between ⚙ button and settings panel. */
export const SETTINGS_POPOVER_GAP_Y_PX = 10;

/** Right inset from viewport — aligns panel right edge with page padding. */
export const SETTINGS_POPOVER_INSET_RIGHT_PX = 16;

export const WORKFLOW = Object.freeze({
  AUTO: "auto",
  MANUAL: "manual",
});

export const API_ROUTES = Object.freeze({
  GENERATE_AUTO: "/api/auto/generate",
  MANUAL_PROMPT: "/api/manual/prompt",
  MANUAL_GENERATE: "/api/manual/generate",
  MANUAL_PREVIEW: "/api/manual/preview",
  MANUAL_SECOND_PROMPT: "/api/manual/manual_second_prompt",
  CONFIG: "/api/config",
  MIGRATION_PROMPT: "/api/migration-prompt",
  TEMPLATES: "/api/templates",
  ATS_PROMPTS: "/api/ats-prompts",
  SECOND_PROMPTS: "/api/second-prompts",
  profileByBasename: (basename) => `/api/profiles/${encodeURIComponent(basename)}`,
});
