import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeAiSelection,
  formatModelOptionLabel,
  getAiConfig,
  parseUsdPerMillionInOut,
  estimateCostUsdForTokens,
} from "./ai-config.js";

describe("normalizeAiSelection", () => {
  it("keeps a valid openai model", () => {
    assert.deepEqual(normalizeAiSelection("openai", "gpt-4o"), {
      provider: "openai",
      model: "gpt-4o",
    });
  });

  it("keeps a valid anthropic model", () => {
    assert.deepEqual(normalizeAiSelection("anthropic", "claude-3-5-haiku-latest"), {
      provider: "anthropic",
      model: "claude-3-5-haiku-latest",
    });
  });

  it("maps claude provider alias to anthropic", () => {
    assert.equal(normalizeAiSelection("claude", "claude-sonnet-4-20250514").provider, "anthropic");
  });

  it("replaces cross-provider model with provider default", () => {
    assert.deepEqual(normalizeAiSelection("anthropic", "gpt-4o-mini"), {
      provider: "anthropic",
      model: "claude-sonnet-4-6",
    });
  });

  it("falls back to openai default for unknown model", () => {
    assert.deepEqual(normalizeAiSelection("openai", "not-a-real-model"), {
      provider: "openai",
      model: "gpt-5-mini",
    });
  });

  it("formats model option label as id : price (speed)", () => {
    assert.equal(
      formatModelOptionLabel({ id: "gpt-4o", price: "~$2/$8", speed: "fast" }),
      "gpt-4o : ~$2/$8 (fast)"
    );
  });

  it("keeps a valid groq model", () => {
    assert.deepEqual(normalizeAiSelection("groq", "openai/gpt-oss-20b"), {
      provider: "groq",
      model: "openai/gpt-oss-20b",
    });
  });

  it("falls back to groq default for unknown groq model", () => {
    assert.deepEqual(normalizeAiSelection("groq", "not-on-groq"), {
      provider: "groq",
      model: "llama-3.1-8b-instant",
    });
  });
});

describe("getAiConfig", () => {
  it("marks providerFromEnv and modelFromEnv when vars are non-empty", () => {
    const p0 = process.env.AI_PROVIDER;
    const m0 = process.env.AI_MODEL;
    process.env.AI_PROVIDER = "groq";
    process.env.AI_MODEL = "llama-3.1-8b-instant";
    try {
      const cfg = getAiConfig();
      assert.equal(cfg.providerFromEnv, true);
      assert.equal(cfg.modelFromEnv, true);
      assert.equal(cfg.provider, "groq");
      assert.equal(cfg.model, "llama-3.1-8b-instant");
    } finally {
      if (p0 === undefined) delete process.env.AI_PROVIDER;
      else process.env.AI_PROVIDER = p0;
      if (m0 === undefined) delete process.env.AI_MODEL;
      else process.env.AI_MODEL = m0;
    }
  });

  it("marks flags false when AI_PROVIDER and AI_MODEL are unset", () => {
    const p0 = process.env.AI_PROVIDER;
    const m0 = process.env.AI_MODEL;
    delete process.env.AI_PROVIDER;
    delete process.env.AI_MODEL;
    try {
      const cfg = getAiConfig();
      assert.equal(cfg.providerFromEnv, false);
      assert.equal(cfg.modelFromEnv, false);
      assert.equal(cfg.provider, "openai");
      assert.equal(cfg.model, "gpt-5-mini");
    } finally {
      if (p0 !== undefined) process.env.AI_PROVIDER = p0;
      if (m0 !== undefined) process.env.AI_MODEL = m0;
    }
  });
});

describe("parseUsdPerMillionInOut", () => {
  it("parses tilde and plain dollar pairs", () => {
    assert.deepEqual(parseUsdPerMillionInOut("~$1.75/$14"), { inputUsdPerM: 1.75, outputUsdPerM: 14 });
    assert.deepEqual(parseUsdPerMillionInOut("$0.59/$0.79"), { inputUsdPerM: 0.59, outputUsdPerM: 0.79 });
  });

  it("returns null for see vendor", () => {
    assert.equal(parseUsdPerMillionInOut("see vendor"), null);
  });
});

describe("estimateCostUsdForTokens", () => {
  it("computes from gpt-4o-mini list prices", () => {
    const usd = estimateCostUsdForTokens("openai", "gpt-4o-mini", 1_000_000, 1_000_000);
    assert.ok(usd != null && usd > 0);
  });
});
