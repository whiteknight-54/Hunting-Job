/** Extract a JSON object from markdown fences, preamble, or minor AI formatting issues. */
export function extractJsonFromText(rawText) {
  if (rawText == null) throw new Error("Pasted content is required");

  let content = String(rawText).trim();
  if (!content) throw new Error("Pasted content is empty");

  const codeBlockPattern = /```(?:json|javascript|js)?\s*/gi;
  const prefixPattern = /^(here is|here's|this is|the json is|json:|response:):?\s*/gim;

  let cleaned = content
    .replace(codeBlockPattern, "")
    .replace(/```\s*/g, "")
    .replace(prefixPattern, "")
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'");

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
    const fallback = cleaned.lastIndexOf("}");
    if (fallback === -1) throw new Error("No JSON object found in pasted content");
    content = cleaned.substring(0, fallback + 1).trim();
  } else {
    content = cleaned.substring(0, lastBrace + 1).trim();
  }

  try {
    return JSON.parse(content);
  } catch (parseError) {
    try {
      let fixed = content;
      fixed = fixed.replace(/,(\s*[}\]])/g, "$1");
      fixed = fixed.replace(/("(?:[^"\\]|\\.)*")\s*\n\s*/g, "$1 ");
      fixed = fixed.replace(/("(?:[^"\\]|\\.)*")\s*:\s*"([^"]*)"([,}])/g, (_m, key, value, ending) => {
        return `${key}: "${value.replace(/"/g, '\\"')}"${ending}`;
      });
      fixed = fixed.replace(/\/\/.*$/gm, "");
      fixed = fixed.replace(/\/\*[\s\S]*?\*\//g, "");
      fixed = fixed.replace(/}\s*\n\s*{/g, "},\n{");
      fixed = fixed.replace(/]\s*\n\s*\[/g, "],\n[");
      fixed = fixed.replace(/"\s*\n\s*"/g, '",\n"');
      return JSON.parse(fixed);
    } catch {
      try {
        let aggressive = content.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, "");
        aggressive = aggressive.replace(/([^\\])"([^",:}\]]*)"\s*:/g, '$1"$2":');
        return JSON.parse(aggressive);
      } catch {
        throw new Error(`Invalid JSON: ${parseError.message}`);
      }
    }
  }
}
