import { getTemplate } from "../../lib/pdf-templates";
import { getPreviewMockData } from "../../lib/preview-mock-data";
import { renderPdfToBuffer } from "../../lib/core/pdf.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).send("Method not allowed");
  }

  try {
    const { template } = req.query;

    if (!template) {
      return res.status(400).send("Template parameter required");
    }

    const templateName = template || "Resume";
    const TemplateComponent = getTemplate(templateName);

    if (!TemplateComponent) {
      return res.status(404).send(`Template "${templateName}" not found`);
    }

    const mockupData = getPreviewMockData();
    const pdfBuffer = await renderPdfToBuffer(TemplateComponent, mockupData);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="preview-${templateName}.pdf"`);
    res.status(200).end(pdfBuffer);
  } catch (err) {
    console.error("Preview generation error:", err);
    res.status(500).send("Preview generation failed: " + err.message);
  }
}
