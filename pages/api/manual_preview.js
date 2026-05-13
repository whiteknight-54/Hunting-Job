import path from "path";
import { promises as fsPromises } from "fs";
import { getTemplate } from "../../lib/pdf-templates";
import { getTemplateForProfile, getProfileBySlug } from "../../lib/profile-template-mapping";
import { tryParseResumeOutput } from "../../lib/resume-json-parser";
import { buildTemplateDataFromProfileAndResume } from "../../lib/build-template-data";
import { getPreviewMockDataForProfile } from "../../lib/preview-mock-data";
import { renderPdfToBuffer } from "../../lib/render-pdf-buffer";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  try {
    const { profile: profileSlug, template, content } = req.body || {};

    if (!profileSlug) return res.status(400).json({ error: "Profile slug required" });

    const profileConfig = getProfileBySlug(profileSlug);
    if (!profileConfig) {
      return res.status(404).json({ error: `Profile with slug "${profileSlug}" not found` });
    }

    const templateName = template || getTemplateForProfile(profileSlug) || "Resume";
    const TemplateComponent = getTemplate(templateName);
    if (!TemplateComponent) return res.status(404).json({ error: `Template "${templateName}" not found` });

    const profilePath = path.join(process.cwd(), "resumes", `${profileConfig.resume}.json`);
    const profileContent = await fsPromises.readFile(profilePath, "utf-8");
    const profileData = JSON.parse(profileContent);

    const resumeContent = tryParseResumeOutput(content);
    const usingLiveData = !!resumeContent;

    const templateData = usingLiveData
      ? buildTemplateDataFromProfileAndResume(profileData, resumeContent)
      : getPreviewMockDataForProfile(profileData);

    const pdfBuffer = await renderPdfToBuffer(TemplateComponent, templateData);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="preview-${templateName}.pdf"`);
    res.setHeader("X-Preview-Mode", usingLiveData ? "live" : "sample");
    res.status(200).end(pdfBuffer);
  } catch (err) {
    console.error("Manual preview error:", err);
    return res.status(500).json({
      error: "Preview generation failed",
      message: err?.message || "Unknown error",
    });
  }
}
