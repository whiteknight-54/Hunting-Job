import ResumeTemplate from './ResumeTemplate';
import { ResumeTechTeal } from './templates/ResumeTechTeal';
import { ResumeModernGreen } from './templates/ResumeModernGreen';
import { ResumeCreativeBurgundy } from './templates/ResumeCreativeBurgundy';
import { ResumeBoldEmerald } from './templates/ResumeBoldEmerald';
import { ResumeCorporateSlate } from './templates/ResumeCorporateSlate';
import { ResumeExecutiveNavy } from './templates/ResumeExecutiveNavy';
import { ResumeClassicCharcoal } from './templates/ResumeClassicCharcoal';
import { ResumeConsultantSteel } from './templates/ResumeConsultantSteel';
import { ResumeAcademicPurple } from './templates/ResumeAcademicPurple';
import { ResumeVisionMidnight } from './templates/ResumeVisionMidnight';
import { ResumeVisionSage } from './templates/ResumeVisionSage';
import { ResumeVisionCoral } from './templates/ResumeVisionCoral';

/** UI / API catalog — keep in sync with `templates` registry keys. */
export const TEMPLATE_CATALOG = [
  { id: 'Resume', name: 'Classic (Default)' },
  { id: 'Resume-Academic-Purple', name: 'Academic Purple' },
  { id: 'Resume-Bold-Emerald', name: 'Bold Emerald' },
  { id: 'Resume-Classic-Charcoal', name: 'Classic Charcoal' },
  { id: 'Resume-Consultant-Steel', name: 'Consultant Steel' },
  { id: 'Resume-Corporate-Slate', name: 'Corporate Slate' },
  { id: 'Resume-Creative-Burgundy', name: 'Creative Burgundy' },
  { id: 'Resume-Executive-Navy', name: 'Executive Navy' },
  { id: 'Resume-Modern-Green', name: 'Modern Green' },
  { id: 'Resume-Tech-Teal', name: 'Tech Teal' },
  { id: 'Resume-Vision-Midnight', name: 'Vision Midnight' },
  { id: 'Resume-Vision-Sage', name: 'Vision Sage' },
  { id: 'Resume-Vision-Coral', name: 'Vision Coral' },
];

const templates = Object.fromEntries(
  TEMPLATE_CATALOG.map(({ id }) => {
    const map = {
      Resume: ResumeTemplate,
      'Resume-Tech-Teal': ResumeTechTeal,
      'Resume-Modern-Green': ResumeModernGreen,
      'Resume-Creative-Burgundy': ResumeCreativeBurgundy,
      'Resume-Bold-Emerald': ResumeBoldEmerald,
      'Resume-Corporate-Slate': ResumeCorporateSlate,
      'Resume-Executive-Navy': ResumeExecutiveNavy,
      'Resume-Classic-Charcoal': ResumeClassicCharcoal,
      'Resume-Consultant-Steel': ResumeConsultantSteel,
      'Resume-Academic-Purple': ResumeAcademicPurple,
      'Resume-Vision-Midnight': ResumeVisionMidnight,
      'Resume-Vision-Sage': ResumeVisionSage,
      'Resume-Vision-Coral': ResumeVisionCoral,
    };
    return [id, map[id]];
  })
);

/** @returns {import('react').ComponentType | null} */
export const getTemplate = (templateId) => {
  const name = String(templateId || '').trim() || 'Resume';
  return templates[name] ?? null;
};

export const listTemplateCatalog = () =>
  [...TEMPLATE_CATALOG].sort((a, b) => {
    if (a.id === 'Resume') return -1;
    if (b.id === 'Resume') return 1;
    return a.name.localeCompare(b.name);
  });

export default templates;
