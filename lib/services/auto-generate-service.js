import React from "react";
import { renderToStream } from "@react-pdf/renderer";
import { getTemplate } from "../pdf-templates";
import { callAI } from "../ai-service";
import { getTemplateForProfile } from "../profile-template-mapping";
import { buildAtsPromptForProfile } from "../build-ats-prompt";
import {
  parseTailoredResumeFromText,
  TailoredResumeValidationError,
} from "../tailored-resume/index.js";
import { buildTemplateDataFromProfileAndResume } from "../tailored-resume/build-pdf-data.js";
import { buildPdfFileName } from "../pdf-filename";
import { loadProfileBySlug } from "../load-profile";

const AI_TIMEOUT_MS = 180000;
const AI_RETRIES = 1;

function extractAiText(response) {
  if (!response.content || !Array.isArray(response.content) || response.content.length === 0) {
    throw new Error("AI response has no content");
  }
  return (response.content || [])
    .map((part) => {
      if (typeof part === "string") return part;
      if (part?.text) return part.text;
      if (part?.type === "text" && part?.text) return part.text;
      if (typeof part === "object") return JSON.stringify(part);
      return String(part || "");
    })
    .join("")
    .trim();
}

function assertNotApology(content) {
  const lower = content.toLowerCase();
  if (lower.startsWith("i'm sorry") || lower.startsWith("i cannot") || lower.startsWith("i apologize")) {
    throw new Error("AI refused to generate resume. Try a shorter job description or use manual workflow.");
  }
}

function parseTailoredFromAiContent(content, profileData) {
  assertNotApology(content);
  const expectedExperienceCount = Array.isArray(profileData?.experience) ? profileData.experience.length : null;
  try {
    return parseTailoredResumeFromText(content, { expectedExperienceCount });
  } catch (err) {
    if (err instanceof TailoredResumeValidationError) {
      const detail = err.issues?.length > 1 ? `${err.message}; ${err.issues.slice(1, 4).join("; ")}` : err.message;
      const e = new Error(`AI resume JSON failed validation: ${detail}`);
      e.statusCode = 422;
      throw e;
    }
    throw new Error(`AI returned invalid JSON: ${err.message}`);
  }
}

async function callAiWithOptionalRetry(prompt, provider, model, firstResponse, profileData) {
  let content = extractAiText(firstResponse);
  let totalInput = firstResponse.usage?.input_tokens ?? 0;
  let totalOutput = firstResponse.usage?.output_tokens ?? 0;

  const hitLimit = firstResponse.stop_reason === "max_tokens" || firstResponse.stop_reason === "length";
  const hasBraces = content.includes("{") && content.includes("}");

  if (hitLimit && hasBraces) {
    try {
      const expectedExperienceCount = Array.isArray(profileData?.experience) ? profileData.experience.length : null;
      parseTailoredResumeFromText(content, { expectedExperienceCount });
      return { content, totalInput, totalOutput };
    } catch {
      /* retry */
    }

    const concisePrompt = prompt
      .replace(/TOTAL: 60-80 skills maximum/g, "TOTAL: 50-60 skills maximum")
      .replace(/Per category: 8-12 skills/g, "Per category: 6-10 skills")
      .replace(/6 bullets each/g, "5 bullets each")
      .replace(/5-6 bullets per job/g, "4-5 bullets per job");

    const retryResponse = await callAI(concisePrompt, provider, model, 5000, AI_RETRIES, AI_TIMEOUT_MS);
    totalInput += retryResponse.usage?.input_tokens ?? 0;
    totalOutput += retryResponse.usage?.output_tokens ?? 0;
    content = extractAiText(retryResponse);
  }

  return { content, totalInput, totalOutput };
}

/** Auto workflow: profile + JD → AI → tailored resume → PDF stream. */
export async function runAutoGenerate({
  profileSlug,
  jd,
  template,
  provider = "openai",
  model = null,
  roleName,
  companyName = null,
  atsPrompt,
  questions = null,
}) {
  if (!["claude", "openai"].includes(provider)) {
    const err = new Error(`Unsupported provider: ${provider}`);
    err.statusCode = 400;
    throw err;
  }

  const { data: profileData, basename } = await loadProfileBySlug(profileSlug);
  const templateName = template || getTemplateForProfile(profileSlug) || "Resume";
  const TemplateComponent = getTemplate(templateName);
  if (!TemplateComponent) {
    const err = new Error(`Template "${templateName}" not found`);
    err.statusCode = 404;
    throw err;
  }

  const { prompt } = await buildAtsPromptForProfile({
    profileSlug,
    profileData,
    jobDescription: jd,
    atsPromptOverride: atsPrompt,
    roleTitle: roleName || "",
    companyName: companyName || "",
    questions: questions || "",
  });

  const aiResponse = await callAI(prompt, provider, model, 5000, AI_RETRIES, AI_TIMEOUT_MS);
  const { content, totalInput, totalOutput } = await callAiWithOptionalRetry(
    prompt,
    provider,
    model,
    aiResponse,
    profileData
  );
  const tailoredResume = parseTailoredFromAiContent(content, profileData);
  const templateData = buildTemplateDataFromProfileAndResume(profileData, tailoredResume);
  const fileName = buildPdfFileName(basename, roleName, companyName);

  const pdfDocument = React.createElement(TemplateComponent, { data: templateData });
  const pdfStream = await renderToStream(pdfDocument);

  return {
    pdfStream,
    fileName,
    usage: { inputTokens: totalInput, outputTokens: totalOutput },
  };
}
