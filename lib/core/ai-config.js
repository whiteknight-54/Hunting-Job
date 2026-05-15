/**
 * Single source for auto AI: provider list, model pick list, env defaults, validation.
 * Add a model here only — update `AI_MODEL_OPTIONS` and, if it is the default, `DEFAULT_MODELS`.
 * `price` is rough USD per 1M in/out (omit “per 1M” in strings — UI shows `id : price (speed)`).
 *
 * Selection priority (auto UI init): explicit env (`AI_PROVIDER` / `AI_MODEL`) → localStorage
 * selector → defaults in this file. See `getAiConfig` + `useAiSelection`.
 */
const DEFAULT_MODELS = Object.freeze({
  openai: "gpt-5-mini",
  anthropic: "claude-sonnet-4-6",
  groq: "llama-3.1-8b-instant",
});

/** One row in `AI_MODEL_OPTIONS` (frozen object). */
function modelRow(id, price, speed) {
  return Object.freeze({ id, price, speed });
}

/** Auto workflow: localStorage keys for provider/model picker. */
export const AI_LS_KEYS = Object.freeze({
  provider: "auto_ai_provider",
  model: "auto_ai_model",
});

/** Provider dropdown (UI + API values). */
export const AI_PROVIDER_OPTIONS = Object.freeze([
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
  { value: "groq", label: "Groq" },
]);

/** Allowed models per provider (order = UI list). Merged with legacy catalog IDs where missing. */
export const AI_MODEL_OPTIONS = Object.freeze({
  openai: Object.freeze([
    // GPT-5.2 family (legacy catalog)
    modelRow("gpt-5.2-chat-latest", "see vendor", "chat-latest"),
    modelRow("gpt-5.2", "~$1.75/$14", "slower (frontier)"),
    modelRow("gpt-5.2-pro", "see vendor", "pro tier"),
    // Current frontier + GPT-5.x
    modelRow("gpt-5.5", "~$1.75/$14", "slower (frontier, higher TTFT)"),
    modelRow("gpt-5.4", "~$1.75/$14", "slower (frontier)"),
    modelRow("gpt-5", "see vendor", "frontier"),
    modelRow("gpt-5-mini", "~$0.25/$2", "medium–fast"),
    modelRow("gpt-5-nano", "see vendor", "fastest 5.x class (typical)"),
    modelRow("gpt-5.1", "see vendor", "5.1 tier"),
    modelRow("gpt-5.4-mini", "~$0.25/$2", "medium–fast"),
    modelRow("gpt-5.4-nano", "see vendor", "fast (nano)"),
    // GPT-4.1
    modelRow("gpt-4.1", "~$2/$8", "medium"),
    modelRow("gpt-4.1-mini", "~$0.40/$1.60", "fast (verify)"),
    modelRow("gpt-4.1-nano", "~$0.10/$0.40", "very fast (verify)"),
    // GPT-4o
    modelRow("gpt-4o", "~$2.50/$10", "fast"),
    modelRow("gpt-4o-mini", "~$0.15/$0.60", "very fast"),
    // GPT-4 legacy
    modelRow("gpt-4-turbo", "~$10/$30", "medium (older)"),
    modelRow("gpt-4-turbo-preview", "~$10/$30", "medium (preview)"),
    modelRow("gpt-4", "~$30/$60", "slow / legacy (verify)"),
    modelRow("gpt-3.5-turbo", "~$0.50/$1.50", "fast / legacy (verify)"),
  ]),
  anthropic: Object.freeze([
    // Claude 4.5 (dated + latest aliases)
    modelRow("claude-opus-4-5-20251124", "~$5/$25", "slow (verify id)"),
    modelRow("claude-opus-4-5-20251101", "~$5/$25", "slow"),
    modelRow("claude-sonnet-4-5-20250929", "~$3/$15", "medium"),
    modelRow("claude-haiku-4-5-20251001", "~$1/$5", "fast (dated Haiku 4.5)"),
    modelRow("claude-haiku-4-5", "~$1/$5", "fast"),
    // Claude 4.x
    modelRow("claude-opus-4-7", "~$5/$25", "slowest (frontier)"),
    modelRow("claude-opus-4-6", "~$5/$25", "slow"),
    modelRow("claude-opus-4-1-20250805", "~$15/$75", "slow (legacy Opus 4.1)"),
    modelRow("claude-opus-4-20250514", "~$15/$75", "slow (legacy Opus 4)"),
    modelRow("claude-sonnet-4-6", "~$3/$15", "medium (balanced)"),
    modelRow("claude-sonnet-4-20250514", "~$3/$15", "medium"),
    // Claude 3.7 / 3.5 dated
    modelRow("claude-3-7-sonnet-20250219", "~$3/$15", "medium (verify)"),
    modelRow("claude-3-5-sonnet-20241022", "~$3/$15", "medium (dated)"),
    modelRow("claude-3-5-sonnet-latest", "~$3/$15", "medium"),
    modelRow("claude-3-5-haiku-20241022", "~$0.80/$4", "fast (dated)"),
    modelRow("claude-3-5-haiku-latest", "~$0.80/$4", "fast"),
  ]),
  groq: Object.freeze([
    modelRow("llama-3.3-70b-versatile", "$0.59/$0.79", "~280 tok/s"),
    modelRow("openai/gpt-oss-120b", "$0.15/$0.60", "~500 tok/s"),
    modelRow("openai/gpt-oss-20b", "$0.075/$0.30", "~1000 tok/s"),
    modelRow("llama-3.1-8b-instant", "$0.05/$0.08", "~560 tok/s"),
    modelRow("meta-llama/llama-4-scout-17b-16e-instruct", "$0.11/$0.34", "preview, ~750 tok/s"),
    modelRow("qwen/qwen3-32b", "$0.29/$0.59", "preview, ~400 tok/s"),
  ]),
});

/** Model `<select>` option text: `id : price (speed)`. */
export function formatModelOptionLabel(entry) {
  if (!entry || typeof entry !== "object") return "";
  const { id, price, speed } = entry;
  if (!id) return "";
  return `${id} : ${price} (${speed})`;
}

/** Parse `price` field for `$a/$b` or `~$a/$b` (USD per 1M in / out). Returns null if not parseable. */
export function parseUsdPerMillionInOut(priceStr) {
  const s = String(priceStr || "");
  const m = s.match(/~\s*\$([\d.]+)\s*\/\s*\$([\d.]+)/) || s.match(/\$([\d.]+)\s*\/\s*\$([\d.]+)/);
  if (!m) return null;
  const inputUsdPerM = parseFloat(m[1]);
  const outputUsdPerM = parseFloat(m[2]);
  if (!Number.isFinite(inputUsdPerM) || !Number.isFinite(outputUsdPerM)) return null;
  return { inputUsdPerM, outputUsdPerM };
}

/** Rough USD cost from token counts using list prices in `AI_MODEL_OPTIONS` (indicative only). */
export function estimateCostUsdForTokens(provider, model, promptTokens, completionTokens) {
  const rows = getModelOptionRows(provider);
  const row = rows.find((r) => r.id === model);
  if (!row) return null;
  const rates = parseUsdPerMillionInOut(row.price);
  if (!rates) return null;
  const pt = Number(promptTokens) || 0;
  const ct = Number(completionTokens) || 0;
  const usd = (pt / 1e6) * rates.inputUsdPerM + (ct / 1e6) * rates.outputUsdPerM;
  if (!Number.isFinite(usd)) return null;
  return Math.round(usd * 1e6) / 1e6;
}


export function getModelOptionRows(provider) {
  const p = normalizeProvider(provider);
  return AI_MODEL_OPTIONS[p] || AI_MODEL_OPTIONS.openai;
}

function getModelIdsForProvider(provider) {
  return getModelOptionRows(provider).map((r) => r.id);
}

export function getDefaultModel(provider) {
  const p = normalizeProvider(provider);
  return DEFAULT_MODELS[p] ?? DEFAULT_MODELS.openai;
}

export function normalizeProvider(provider) {
  const p = String(provider || "openai").toLowerCase();
  if (p === "anthropic" || p === "claude") return "anthropic";
  if (p === "groq") return "groq";
  return "openai";
}

/** Coerce provider + model to a supported pair (client/env selections). */
export function normalizeAiSelection(provider, model) {
  const normalizedProvider = normalizeProvider(provider);
  const ids = new Set(getModelIdsForProvider(normalizedProvider));
  const trimmed = String(model || "").trim();
  const normalizedModel = trimmed && ids.has(trimmed) ? trimmed : getDefaultModel(normalizedProvider);
  return { provider: normalizedProvider, model: normalizedModel };
}

export function getAiKeyStatus() {
  return {
    openai: Boolean((process.env.OPENAI_API_KEY || "").trim()),
    anthropic: Boolean((process.env.ANTHROPIC_API_KEY || "").trim()),
    groq: Boolean((process.env.GROQ_API_KEY || "").trim()),
  };
}

/** Server-side AI provider, model, key flags, and whether env vars fixed provider/model. */
export function getAiConfig() {
  const pr = String(process.env.AI_PROVIDER ?? "").trim();
  const providerFromEnv = pr.length > 0;
  const provider = normalizeProvider(providerFromEnv ? pr : "openai");

  const mr = String(process.env.AI_MODEL ?? "").trim();
  const modelFromEnv = mr.length > 0;
  const modelCandidate = modelFromEnv ? mr : getDefaultModel(provider);
  const { model } = normalizeAiSelection(provider, modelCandidate);

  const keys = getAiKeyStatus();

  return { provider, model, keyActive: keys[provider], keys, providerFromEnv, modelFromEnv };
}
