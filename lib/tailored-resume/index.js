/**
 * Tailored resume — AI/GPT JSON output (distinct from profiles/*.json base data).
 *
 * Pipeline: parse-text → normalize → validate → merge-with-profile → build-pdf-data
 */
export {
  TAILORED_RESUME_ROOT_KEYS,
  TAILORED_RESUME_JSON_EXAMPLE,
  RESUME_OUTPUT_SCHEMA_APPENDIX,
} from "./schema.js";

export {
  ATS_PROMPT_GLOSSARY_BLOCK,
  ATS_PROMPT_INPUT_BLOCK,
  ATS_PROMPT_OUTPUT_BLOCK,
} from "./ats-prompt-blocks.js";

export { extractJsonFromText } from "./parse-text.js";
export { normalizeTailoredResumeOutput } from "./normalize.js";
export { validateTailoredResumeOutput, isValidTailoredResumeOutput } from "./validate.js";

export {
  parseTailoredResumeFromText,
  tryParseTailoredResume,
  TailoredResumeParseError,
  TailoredResumeValidationError,
  isTailoredResumeInputError,
} from "./parse.js";

export {
  mergeProfileWithTailoredResume,
  mergeProfileWithResumeOutput,
} from "./merge-with-profile.js";

export { buildTemplateDataFromProfileAndResume } from "./build-pdf-data.js";

// Legacy aliases (resume naming in older code)
export { isValidTailoredResumeOutput as isValidResumeOutput } from "./validate.js";
export { tryParseTailoredResume as tryParseResumeOutput } from "./parse.js";
export { parseTailoredResumeFromText as parseResumeContentFromText } from "./parse.js";
export {
  TailoredResumeParseError as ResumeParseError,
  TailoredResumeValidationError as ResumeValidationError,
  isTailoredResumeInputError as isResumeInputError,
} from "./parse.js";
