import path from "path";
import { promises as fsPromises } from "fs";
import React from "react";
import { renderToStream } from "@react-pdf/renderer";
import { getTemplate } from "../../lib/pdf-templates";
import { getTemplateForProfile, getProfileBySlug } from "../../lib/profile-template-mapping";

const extractJsonFromText = (rawText) => {
  if (rawText == null) throw new Error("Pasted content is required");

  let content = String(rawText).trim();
  if (!content) throw new Error("Pasted content is empty");

  const codeBlockPattern = /```(?:json|javascript|js)?\s*/gi;
  const prefixPattern = /^(here is|here's|this is|the json is|json:|response:):?\s*/gim;
  const smartDoubleQuotesPattern = /[“”]/g;
  const smartSingleQuotesPattern = /[‘’]/g;

  // Remove markdown code fences and common prefixes/explanations
  let cleaned = content.replace(codeBlockPattern, "").replace(/```\s*/g, "");
  cleaned = cleaned.replace(prefixPattern, "");
  cleaned = cleaned.replace(smartDoubleQuotesPattern, '"').replace(smartSingleQuotesPattern, "'");

  const firstBrace = cleaned.indexOf("{");
  if (firstBrace === -1) throw new Error("No JSON object found in pasted content");
  cleaned = cleaned.substring(firstBrace);

  // Find the matching closing brace for the first object
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

  // Parse with progressively stronger fixes (mirrors /api/generate)
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
      // Common ChatGPT mistake: missing commas between array elements / objects
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
    } catch (secondError) {
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

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  try {
    const { profile: profileSlug, template, roleName, companyName = null, content } = req.body || {};

    if (!profileSlug) return res.status(400).send("Profile slug required");
    if (!roleName || !String(roleName).trim()) return res.status(400).send("Role name is required");
    if (!content) return res.status(400).send("Pasted content required");

    const profileConfig = getProfileBySlug(profileSlug);
    if (!profileConfig) {
      return res.status(404).send(`Profile with slug "${profileSlug}" not found`);
    }

    const resumeName = profileConfig.resume;
    const templateName = template || getTemplateForProfile(profileSlug) || "Resume";
    const TemplateComponent = getTemplate(templateName);
    if (!TemplateComponent) return res.status(404).send(`Template "${templateName}" not found`);

    const profilePath = path.join(process.cwd(), "resumes", `${resumeName}.json`);
    const profileContent = await fsPromises.readFile(profilePath, "utf-8");
    const profileData = JSON.parse(profileContent);

    const resumeContent = extractJsonFromText(content);

    if (!resumeContent?.title || !resumeContent?.summary || !resumeContent?.skills || !resumeContent?.experience) {
      return res.status(400).json({
        error: "Missing required fields in pasted JSON (title, summary, skills, experience)",
        fieldsFound: Object.keys(resumeContent || {}),
      });
    }

    const templateData = {
      name: profileData.name || "Unknown",
      title: resumeContent.title || "Senior Software Engineer",
      email: profileData.email || "",
      phone: null,
      location: profileData.location || "",
      linkedin: null,
      website: null,
      summary: resumeContent.summary || "",
      skills: resumeContent.skills || {},
      experience: (profileData.experience || []).map((job, idx) => ({
        title: job?.title || resumeContent.experience?.[idx]?.title || "Engineer",
        company: job?.company || "Unknown Company",
        location: job?.location || "",
        start_date: job?.start_date || "",
        end_date: job?.end_date || "",
        details: resumeContent.experience?.[idx]?.details || [],
      })),
      education: profileData.education || [],
    };

    const sanitizePattern = /[^A-Za-z0-9_-]/g;
    const spacePattern = /\s+/g;

    const nameParts = resumeName ? resumeName.trim().split(/\s+/) : [];
    let baseName;
    if (nameParts.length === 0) baseName = "resume";
    else if (nameParts.length === 1) baseName = nameParts[0].replace(sanitizePattern, "");
    else baseName = `${nameParts[0]}_${nameParts[nameParts.length - 1]}`.replace(sanitizePattern, "");

    const sanitizedRoleName = String(roleName).trim().replace(spacePattern, "_").replace(sanitizePattern, "");
    baseName = `${baseName}_${sanitizedRoleName}`;

    if (companyName && String(companyName).trim()) {
      const sanitizedCompanyName = String(companyName).trim().replace(spacePattern, "_").replace(sanitizePattern, "");
      baseName = `${baseName}_${sanitizedCompanyName}`;
    }

    const fileName = `${baseName}.pdf`;

    const pdfDocument = React.createElement(TemplateComponent, { data: templateData });
    const pdfStream = await renderToStream(pdfDocument);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    for await (const chunk of pdfStream) {
      res.write(chunk);
    }
    res.end();
  } catch (err) {
    console.error("Manual PDF generation error:", err);
    return res.status(500).json({
      error: "Manual PDF generation failed",
      message: err?.message || "Unknown error occurred",
    });
  }
}

