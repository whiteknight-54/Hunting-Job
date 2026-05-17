import { getPreviewMockData } from "../../lib/preview-mock-data";
import { renderPdfToBuffer, resolveTemplateComponent } from "../../lib/core/pdf.js";
import { guardApi } from "../../lib/core/guard-api.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).send("Method not allowed");
  }
  if (!(await guardApi(req, res))) return;

  try {
    const { template } = req.query;

    if (!template) {
      return res.status(400).send("Template parameter required");
    }

    const templateName = template || "Resume";
    let TemplateComponent;
    try {
      ({ component: TemplateComponent } = await resolveTemplateComponent(null, templateName));
    } catch (err) {
      if (err?.statusCode === 404) {
        return res.status(404).send(`Template "${templateName}" not found`);
      }
      throw err;
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
