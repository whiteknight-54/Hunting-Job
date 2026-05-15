import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { getTemplate } from "../pdf-templates";
import { getTemplateForProfile } from "../profile-template-mapping";

export function resolveTemplateComponent(profileSlug, templateOverride) {
  const id = String(templateOverride || "").trim() || getTemplateForProfile(profileSlug) || "Resume";
  const component = getTemplate(id);
  if (!component) {
    const err = new Error(`Template "${id}" not found`);
    err.statusCode = 404;
    throw err;
  }
  return { id, component };
}

export async function renderPdfToBuffer(TemplateComponent, data) {
  const element = React.createElement(TemplateComponent, { data });
  return renderToBuffer(element);
}

/** Alias used by manual preview API. */
export function resolvePdfTemplate(profileSlug, templateOverride) {
  const { id, component } = resolveTemplateComponent(profileSlug, templateOverride);
  return { templateName: id, TemplateComponent: component };
}
