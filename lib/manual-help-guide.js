/** Manual mode usage guide — rendered in the help dropdown. */
export const MANUAL_HELP_SECTIONS = [
  {
    id: "overview",
    title: "Overview",
    paragraphs: [
      "Manual mode helps you apply to jobs without an API key: copy prompts into ChatGPT, paste JSON back, download a PDF, then run follow-up prompts for screening questions.",
    ],
  },
  {
    id: "inputs",
    title: "Required inputs",
    bullets: [
      "Role title — target job title (used in filename and prompts).",
      "Company name — employer name (used in filename and prompts).",
      "Job description — full JD text for ATS tailoring.",
      "Optional: employer / application questions — passed into ATS context and step 3 prompts.",
    ],
  },
  {
    id: "step1",
    title: "Step 1 — Resume JSON (ATS)",
    bullets: [
      "Pick an ATS prompt (default comes from profile mapping, e.g. final for some profiles).",
      "Click Copy ATS prompt — the expanded prompt is copied and shown in Preview.",
      "Paste into ChatGPT and request JSON only.",
      "Paste the JSON into the right column (markdown code fences are OK).",
    ],
    note: "Profile data is loaded from profiles/{name}.json. You can add extra fields anytime — they are included in step 3 as full profileJson.",
  },
  {
    id: "step2",
    title: "Step 2 — PDF",
    bullets: [
      "Choose a PDF template (default from profile mapping).",
      "Click Download resume PDF — merges profile contact info with ChatGPT experience bullets.",
    ],
  },
  {
    id: "step3",
    title: "Step 3 — Second prompts",
    bullets: [
      "Select prompt type: Screening, Recruiter self-check, FAQ, or Technical extraction.",
      "Edit templates in lib/prompts/2ndPrompts/ (falls back to lib/prompts/second-prompts/ if empty).",
      "Build & copy — merges profile base with pasted resume JSON into tailoredResumeContext for the prompt.",
    ],
  },
  {
    id: "profile",
    title: "Profile JSON (scalable)",
    paragraphs: [
      "profiles/*.json is an open schema: add certifications, languages, skills, projects, screening defaults, notes, or any custom keys.",
      "Second prompts receive tailoredResumeContext (profile + resume merged), plus base profile and raw resume JSON as reference.",
      "Use ⋮ → Review profile to inspect parsed contact, experience, education, and extra fields.",
    ],
  },
  {
    id: "panels",
    title: "Settings (gear icon)",
    bullets: [
      "Quick copy panel — one-tap copy email, phone, LinkedIn, etc.",
      "Preview section — ATS prompt editor + mini template PDF preview.",
      "Screening section — step 3 prompt builder.",
    ],
  },
];
