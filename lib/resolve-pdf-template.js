import { getTemplate } from "./pdf-templates";
import { getTemplateForProfile } from "./profile-template-mapping";

/**
 * Resolve template id + React-PDF component for a profile slug.
 * @returns {{ templateName: string, TemplateComponent: import('react').ComponentType }}
 */
export function resolvePdfTemplate(profileSlug, templateOverride) {
  const templateName = templateOverride || getTemplateForProfile(profileSlug) || "Resume";
  const TemplateComponent = getTemplate(templateName);
  return { templateName, TemplateComponent };
}
