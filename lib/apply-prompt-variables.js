/**
 * Replace {{key}} placeholders in prompt templates.
 */
export function applyPromptVariables(template, variables) {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), String(value ?? ""));
  }
  return result;
}

/** Return unique {{placeholder}} tokens still present after substitution. */
export function findUnreplacedPlaceholders(text) {
  const matches = String(text || "").match(/\{\{[a-zA-Z0-9_]+\}\}/g);
  return matches ? [...new Set(matches)] : [];
}
