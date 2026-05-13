import { extractJsonFromText } from "./parse-text.js";
import { normalizeTailoredResumeOutput } from "./normalize.js";
import { validateTailoredResumeOutput, isValidTailoredResumeOutput } from "./validate.js";

export class TailoredResumeParseError extends Error {
  constructor(message) {
    super(message);
    this.name = "TailoredResumeParseError";
  }
}

export class TailoredResumeValidationError extends Error {
  constructor(message, issues = []) {
    super(message);
    this.name = "TailoredResumeValidationError";
    this.issues = issues;
  }
}

export function isTailoredResumeInputError(err) {
  return err instanceof TailoredResumeParseError || err instanceof TailoredResumeValidationError;
}

/**
 * Parse + normalize + validate tailored resume from raw AI/pasted text.
 * @param {object} [options]
 * @param {number|null} [options.expectedExperienceCount] - profile.experience.length
 */
export function parseTailoredResumeFromText(rawText, options = {}) {
  let parsed;
  try {
    parsed = extractJsonFromText(rawText);
  } catch (err) {
    throw new TailoredResumeParseError(err?.message || "Invalid JSON");
  }

  const normalized = normalizeTailoredResumeOutput(parsed);
  const { valid, issues } = validateTailoredResumeOutput(normalized, {
    expectedExperienceCount: options.expectedExperienceCount ?? null,
  });

  if (!valid) {
    throw new TailoredResumeValidationError(issues[0] || "Invalid tailored resume JSON", issues);
  }

  return normalized;
}

export function tryParseTailoredResume(rawText, options = {}) {
  if (!rawText || !String(rawText).trim()) return null;
  try {
    return parseTailoredResumeFromText(rawText, { ...options, expectedExperienceCount: null });
  } catch {
    try {
      const parsed = extractJsonFromText(String(rawText));
      const normalized = normalizeTailoredResumeOutput(parsed);
      return isValidTailoredResumeOutput(normalized) ? normalized : null;
    } catch {
      return null;
    }
  }
}
