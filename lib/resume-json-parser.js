/**
 * Parse pasted ChatGPT resume JSON (markdown fences, minor fixes).
 */

export const isValidResumeOutput = (obj) => {
  if (!obj || typeof obj !== "object") return false;
  return !!(obj.title && obj.summary && obj.skills && obj.experience);
};

export const extractJsonFromText = (rawText) => {
  if (rawText == null) throw new Error("Pasted content is required");

  let content = String(rawText).trim();
  if (!content) throw new Error("Pasted content is empty");

  const codeBlockPattern = /```(?:json|javascript|js)?\s*/gi;
  const prefixPattern = /^(here is|here's|this is|the json is|json:|response:):?\s*/gim;
  const smartDoubleQuotesPattern = /[“”]/g;
  const smartSingleQuotesPattern = /[‘’]/g;

  let cleaned = content.replace(codeBlockPattern, "").replace(/```\s*/g, "");
  cleaned = cleaned.replace(prefixPattern, "");
  cleaned = cleaned.replace(smartDoubleQuotesPattern, '"').replace(smartSingleQuotesPattern, "'");

  const firstBrace = cleaned.indexOf("{");
  if (firstBrace === -1) throw new Error("No JSON object found in pasted content");
  cleaned = cleaned.substring(firstBrace);

  let braceCount = 0;
  let lastBrace = -1;
  for (let i = 0; i < cleaned.length; i++) {
    if (cleaned[i] === "{") braceCount++;
    if (cleaned[i] === "}") {
      braceCount--;
      if (braceCount === 0) {
        lastBrace = i;
        break;
      }
    }
  }

  if (lastBrace === -1) {
    const fallbackLastBrace = cleaned.lastIndexOf("}");
    if (fallbackLastBrace === -1) throw new Error("No JSON object found in pasted content");
    content = cleaned.substring(0, fallbackLastBrace + 1).trim();
  } else {
    content = cleaned.substring(0, lastBrace + 1).trim();
  }

  try {
    return JSON.parse(content);
  } catch (parseError) {
    try {
      let fixed = content;
      const trailingCommaPattern = /,(\s*[}\]])/g;
      const unescapedNewlinePattern = /("(?:[^"\\]|\\.)*")\s*\n\s*/g;
      const unescapedQuotePattern = /("(?:[^"\\]|\\.)*")\s*:\s*"([^"]*)"([,}])/g;
      const lineCommentPattern = /\/\/.*$/gm;
      const blockCommentPattern = /\/\*[\s\S]*?\*\//g;
      const missingCommaBetweenObjectsPattern = /}\s*\n\s*{/g;
      const missingCommaBetweenArraysPattern = /]\s*\n\s*\[/g;
      const missingCommaBetweenStringsPattern = /"\s*\n\s*"/g;

      fixed = fixed.replace(trailingCommaPattern, "$1");
      fixed = fixed.replace(unescapedNewlinePattern, "$1 ");
      fixed = fixed.replace(unescapedQuotePattern, (match, key, value, ending) => {
        const escapedValue = value.replace(/"/g, '\\"');
        return `${key}: "${escapedValue}"${ending}`;
      });
      fixed = fixed.replace(lineCommentPattern, "");
      fixed = fixed.replace(blockCommentPattern, "");
      fixed = fixed.replace(missingCommaBetweenObjectsPattern, "},\n{");
      fixed = fixed.replace(missingCommaBetweenArraysPattern, "],\n[");
      fixed = fixed.replace(missingCommaBetweenStringsPattern, '",\n"');

      return JSON.parse(fixed);
    } catch {
      try {
        let aggressiveFix = content;
        const controlCharPattern = /[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g;
        const quoteFixPattern = /([^\\])"([^",:}\]]*)"\s*:/g;
        aggressiveFix = aggressiveFix.replace(controlCharPattern, "");
        aggressiveFix = aggressiveFix.replace(quoteFixPattern, '$1"$2":');
        return JSON.parse(aggressiveFix);
      } catch {
        throw new Error(`Invalid JSON: ${parseError.message}`);
      }
    }
  }
};

/** Returns parsed resume output object or null if empty/invalid. */
export const tryParseResumeOutput = (rawText) => {
  if (!rawText || !String(rawText).trim()) return null;
  try {
    const data = extractJsonFromText(rawText);
    return isValidResumeOutput(data) ? data : null;
  } catch {
    return null;
  }
};
