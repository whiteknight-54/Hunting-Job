import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { getTemplateAsync, normalizeTemplateId } from "../pdf-templates/load-template.js";
import { getTemplateForProfile } from "../profile-template-mapping";

export async function resolveTemplateComponent(profileSlug, templateOverride) {
  const id =
    normalizeTemplateId(
      String(templateOverride || "").trim() || getTemplateForProfile(profileSlug) || "Resume"
    );
  const component = await getTemplateAsync(id);
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
export async function resolvePdfTemplate(profileSlug, templateOverride) {
  const { id, component } = await resolveTemplateComponent(profileSlug, templateOverride);
  return { templateName: id, TemplateComponent: component };
}
