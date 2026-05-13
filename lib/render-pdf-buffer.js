import React from "react";
import { renderToStream } from "@react-pdf/renderer";

export async function renderPdfToBuffer(TemplateComponent, data) {
  const pdfDocument = React.createElement(TemplateComponent, { data });
  const pdfStream = await renderToStream(pdfDocument);
  const chunks = [];
  for await (const chunk of pdfStream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
