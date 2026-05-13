import path from "path";
import { promises as fsPromises } from "fs";
import { renderToStream } from "@react-pdf/renderer";
import React from "react";
import { getTemplate } from "../../lib/pdf-templates";
import { getTemplateForProfile, getProfileBySlug } from "../../lib/profile-template-mapping";
import { extractJsonFromText } from "../../lib/resume-json-parser";
import { buildTemplateDataFromProfileAndResume } from "../../lib/build-template-data";

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

    const templateData = buildTemplateDataFromProfileAndResume(profileData, resumeContent);

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
