import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

import { getDefaultModel } from "./ai-config.js";

const ATS_CHAT_TEMPERATURE = 0.3;

/**
 * Some OpenAI chat models only support the default temperature (1); passing e.g. 0.3 returns 400.
 * (Common with GPT-5 family and certain o-series chat endpoints.)
 */
function openAiChatTemperatureForModel(modelId) {
  const id = String(modelId || "").toLowerCase();
  if (id.startsWith("gpt-5")) return 1;
  if (id.startsWith("o1") || id.startsWith("o3") || id.startsWith("o4")) return 1;
  return ATS_CHAT_TEMPERATURE;
}

function extractJsonText(content) {
  const text = String(content || "").trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return text;
  return text.slice(start, end + 1);
}

/** Normalize provider API usage to prompt/completion/total token counts. */
function normalizeUsage(provider, u) {
  if (!u) return null;
  const p = String(provider || "").toLowerCase();
  if (p === "anthropic" || p === "claude") {
    const promptTokens = u.input_tokens ?? u.inputTokens ?? 0;
    const completionTokens = u.output_tokens ?? u.outputTokens ?? 0;
    return {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
    };
  }
  const promptTokens = u.prompt_tokens ?? u.promptTokens ?? 0;
  const completionTokens = u.completion_tokens ?? u.completionTokens ?? 0;
  const totalTokens = u.total_tokens ?? u.totalTokens ?? promptTokens + completionTokens;
  return { promptTokens, completionTokens, totalTokens };
}

async function callOpenAI(prompt, model) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const m = model || getDefaultModel("openai");
  const res = await client.chat.completions.create({
    model: m,
    messages: [{ role: "user", content: prompt }],
    temperature: openAiChatTemperatureForModel(m),
  });
  const text = res.choices?.[0]?.message?.content || "";
  return { text, usage: normalizeUsage("openai", res.usage) };
}

/** Groq exposes an OpenAI-compatible Chat Completions API. */
async function callGroq(prompt, model) {
  const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
  });
  const res = await client.chat.completions.create({
    model: model || getDefaultModel("groq"),
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
  });
  const text = res.choices?.[0]?.message?.content || "";
  return { text, usage: normalizeUsage("groq", res.usage) };
}

async function callAnthropic(prompt, model) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const res = await client.messages.create({
    model: model || getDefaultModel("anthropic"),
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });
  const block = res.content?.find((b) => b.type === "text");
  const text = block?.text || "";
  return { text, usage: normalizeUsage("anthropic", res.usage) };
}

/**
 * Run ATS prompt against configured provider. Returns extracted JSON text + token usage when the API provides it.
 */
export async function runAtsPrompt({ prompt, provider = "openai", model = null }) {
  const p = String(provider || "openai").toLowerCase();
  const resolvedModel = String(model || "").trim() || null;
  let text;
  let usage;
  if (p === "anthropic" || p === "claude") {
    if (!process.env.ANTHROPIC_API_KEY) {
      const err = new Error("ANTHROPIC_API_KEY is not set");
      err.statusCode = 500;
      throw err;
    }
    ({ text, usage } = await callAnthropic(prompt, resolvedModel));
  } else if (p === "groq") {
    if (!process.env.GROQ_API_KEY) {
      const err = new Error("GROQ_API_KEY is not set");
      err.statusCode = 500;
      throw err;
    }
    ({ text, usage } = await callGroq(prompt, resolvedModel));
  } else {
    if (!process.env.OPENAI_API_KEY) {
      const err = new Error("OPENAI_API_KEY is not set");
      err.statusCode = 500;
      throw err;
    }
    ({ text, usage } = await callOpenAI(prompt, resolvedModel));
  }
  return { raw: extractJsonText(text), usage };
}
