import { isKnownTemplateId } from "./catalog.js";

/** Dynamic imports — only the requested template is loaded into the serverless bundle path. */
const TEMPLATE_LOADERS = {
  Resume: () => import("./ResumeTemplate.js").then((m) => m.default),
  "Resume-Tech-Teal": () => import("./templates/ResumeTechTeal.js").then((m) => m.ResumeTechTeal),
  "Resume-Modern-Green": () => import("./templates/ResumeModernGreen.js").then((m) => m.ResumeModernGreen),
  "Resume-Creative-Burgundy": () =>
    import("./templates/ResumeCreativeBurgundy.js").then((m) => m.ResumeCreativeBurgundy),
  "Resume-Bold-Emerald": () => import("./templates/ResumeBoldEmerald.js").then((m) => m.ResumeBoldEmerald),
  "Resume-Corporate-Slate": () =>
    import("./templates/ResumeCorporateSlate.js").then((m) => m.ResumeCorporateSlate),
  "Resume-Executive-Navy": () =>
    import("./templates/ResumeExecutiveNavy.js").then((m) => m.ResumeExecutiveNavy),
  "Resume-Classic-Charcoal": () =>
    import("./templates/ResumeClassicCharcoal.js").then((m) => m.ResumeClassicCharcoal),
  "Resume-Consultant-Steel": () =>
    import("./templates/ResumeConsultantSteel.js").then((m) => m.ResumeConsultantSteel),
  "Resume-Academic-Purple": () =>
    import("./templates/ResumeAcademicPurple.js").then((m) => m.ResumeAcademicPurple),
  "Resume-Vision-Midnight": () =>
    import("./templates/ResumeVisionMidnight.js").then((m) => m.ResumeVisionMidnight),
  "Resume-Vision-Sage": () => import("./templates/ResumeVisionSage.js").then((m) => m.ResumeVisionSage),
  "Resume-Vision-Coral": () => import("./templates/ResumeVisionCoral.js").then((m) => m.ResumeVisionCoral),
};

/**
 * @param {string} [templateId]
 * @returns {Promise<import('react').ComponentType | null>}
 */
export async function getTemplateAsync(templateId) {
  const name = String(templateId || "").trim() || "Resume";
  const load = TEMPLATE_LOADERS[name];
  if (!load) return null;
  try {
    return await load();
  } catch {
    return null;
  }
}

export function normalizeTemplateId(templateId) {
  const id = String(templateId || "").trim() || "Resume";
  return isKnownTemplateId(id) ? id : "Resume";
}
