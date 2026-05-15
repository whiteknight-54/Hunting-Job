/**
 * Client-side rough token guesses while auto PDF generation is in flight (actual usage comes from API headers).
 * Uses chars÷4 heuristic for input; fixed completion guess for tailored JSON.
 */
export function roughPromptCompletionTokens(profileData, jd) {
  const templateChars = 9500;
  const profileChars = profileData ? JSON.stringify(profileData).length : 0;
  const jdLen = jd?.length || 0;
  const promptTok = Math.ceil((profileChars + jdLen + templateChars) / 4);
  const completionTok = 3600;
  return { promptTok, completionTok };
}

export function formatTokenShort(n) {
  if (n == null || !Number.isFinite(n)) return "—";
  if (n >= 1_000_000) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 10_000) return `${Math.round(n / 1000)}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(Math.round(n));
}
