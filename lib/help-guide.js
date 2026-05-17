/**
 * Usage guide copy for Manual and Auto profile pages (? → same modal).
 * Wording matches on-screen labels (Layout / AI settings, panel names).
 */
export const HELP_GUIDE_SECTIONS = [
  {
    id: "two-modes",
    title: "Two ways to use this app",
    paragraphs: [
      "Manual — you copy prompts into ChatGPT (or any chat AI), then paste the JSON answer back here to preview and download a PDF.",
      "Auto — you fill the job form once; this app calls the AI for you and downloads the resume PDF when it is ready.",
      "Both screens use the same profile. Use Manual → or Auto → in the header anytime to switch.",
    ],
  },
  {
    id: "manual-steps",
    title: "Manual — step by step",
    intro:
      "On the Manual page you stay in control of the chat AI. The app builds prompts and PDFs from your profile plus the job you paste in.",
    steps: [
      {
        title: "Enter the job details",
        body: "Fill the job title, optional company, and paste the full job description. The more accurate the posting, the better the tailored resume.",
      },
      {
        title: "Copy the ATS prompt and run it in ChatGPT (or similar)",
        body: "Open the ATS prompt block, copy everything, paste into your AI, and ask for JSON only in the shape this app expects. You can pick another ATS prompt from the selector when you want a different style.",
      },
      {
        title: "Paste the JSON and check the preview",
        body: "Paste the response into the tailored resume field. By default the ATS prompt and PDF preview panels are hidden to keep the page compact — turn them on in ⚙ Settings under Preview section when you want to edit the prompt inline or see the layout before downloading.",
      },
      {
        title: "Download your PDF",
        body: "When the preview looks right, use the download action to save the resume PDF.",
      },
      {
        title: "Optional: screening and second prompts",
        body: "If the application has follow-up questions, turn on Screening section in ⚙ Settings, then build second prompts from your answers and copy them into your AI. Built-in second-prompt types include FAQ, Technical Experience, Screening, and Recruiter Manual Checking Simulation.",
      },
    ],
  },
  {
    id: "auto-steps",
    title: "Auto — step by step",
    intro:
      "On the Auto page the app runs the AI for you. You only fill the form and press generate.",
    steps: [
      {
        title: "Enter the job description, APP_KEY and company",
        body: "Job description, APP_KEY and Company is required. also feeds the file name when you add it.",
      },
      {
        title: "Check that Auto is ready to run",
        body: "Next to your name you see the current model and active or inactive. Active means Auto can call that provider. If it says inactive, open ⚙ AI settings and choose another provider, or use Manual with your own chat AI instead.",
      },
      {
        title: "Adjust AI settings if you want",
        body: "Open ⚙ AI settings to pick Provider and Model. The model list shows id, rough price, and speed so you can balance cost and quality. Your last choices are remembered in this browser.",
      },
      {
        title: "Generate and download",
        body: "Press Generate Resume PDF. While it runs you see progress, elapsed time, and a rough idea of tokens and cost. When it finishes, the PDF downloads and you may see a short line with the actual usage from the last run. Open ⚙ AI settings → PDF contact to show or hide phone and LinkedIn on the PDF (defaults: LinkedIn on, phone off).",
      },
    ],
  },
  {
    id: "configuration",
    title: "Configuration",
    paragraphs: [
      "Use ⚙ in the top-right to open settings. What you see depends on which page you are on.",
      "On Manual, ⚙ is Layout Settings: you switch which sections are visible on this page. Choices are saved in this browser.",
      "On Auto, ⚙ is AI settings: you pick which AI provider and which model Auto uses. That panel is also where you read the full model list with price and speed hints.",
    ],
    bullets: [
      "Quick-copy panel (Manual) — on by default. Grid of one-click copy tiles (email, phone, location, postal code, street address when filled, and other fields from your profile). A Drive folder link appears only when the app operator has Drive upload configured.",
      "Preview section (Manual) — ATS prompt preview and PDF preview are off by default; turn each on under ⚙ Settings when you need them.",
      "PDF contact (Manual & Auto) — under PDF preview on Manual, or PDF contact on Auto: Phone and LinkedIn toggles control what appears on the generated PDF header. Defaults: LinkedIn on (clickable link labeled linkedin), phone off.",
      "Screening section (Manual) — off by default. Turn on to build second prompts so your AI can answer application questions using your custom answers and the generated resume context.",
      "Model chip (Auto) — shows the model in use and whether Auto is allowed to call it right now (active vs inactive).",
    ],
  },
  {
    id: "everywhere",
    title: "Tips",
    bullets: [      
      " ⋮ Review profile — read your profile in a friendly layout or as raw JSON, and copy if needed.",
      "Sun / moon — switch light and dark theme.",
      "Manual → / Auto → — same profile, other workflow.",
      "More tips and features will be added soon...",
    ],    
  },
  {
    id: "notes",
    title: "",
    paragraphs: [
      "Thank you for using this app from Boc-e Team",
    ],
  }
];
