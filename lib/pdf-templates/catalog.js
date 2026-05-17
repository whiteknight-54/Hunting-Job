/** Template metadata only — safe for list APIs (no react-pdf imports). */

export const TEMPLATE_CATALOG = [
  { id: "Resume", name: "Classic (Default)" },
  { id: "Resume-Academic-Purple", name: "Academic Purple" },
  { id: "Resume-Bold-Emerald", name: "Bold Emerald" },
  { id: "Resume-Classic-Charcoal", name: "Classic Charcoal" },
  { id: "Resume-Consultant-Steel", name: "Consultant Steel" },
  { id: "Resume-Corporate-Slate", name: "Corporate Slate" },
  { id: "Resume-Creative-Burgundy", name: "Creative Burgundy" },
  { id: "Resume-Executive-Navy", name: "Executive Navy" },
  { id: "Resume-Modern-Green", name: "Modern Green" },
  { id: "Resume-Tech-Teal", name: "Tech Teal" },
  { id: "Resume-Vision-Midnight", name: "Vision Midnight" },
  { id: "Resume-Vision-Sage", name: "Vision Sage" },
  { id: "Resume-Vision-Coral", name: "Vision Coral" },
];

export function listTemplateCatalog() {
  return [...TEMPLATE_CATALOG].sort((a, b) => {
    if (a.id === "Resume") return -1;
    if (b.id === "Resume") return 1;
    return a.name.localeCompare(b.name);
  });
}

export function isKnownTemplateId(templateId) {
  const id = String(templateId || "").trim();
  return TEMPLATE_CATALOG.some((t) => t.id === id);
}
