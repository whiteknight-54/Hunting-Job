# Hunting-Job — Resume Generator

Next.js app for generating ATS-tailored resume PDFs from file-based candidate profiles. Two workflows share the same profile data and PDF templates:

| Workflow | Route | AI keys required? |
|----------|-------|-------------------|
| **Auto** | `/{slug}` | Yes (OpenAI or Claude on the server) |
| **Manual** | `/manual/{slug}` | No (copy prompts into ChatGPT, paste JSON back) |

No authentication, no database — profiles live in `profiles/*.json`, and all server logic runs through Next.js API routes.

---

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), enter a profile slug (e.g. `jf`), and choose **auto** or **manual** from the profile page.

### Environment variables (auto workflow)

Create `.env.local` in the project root:

```env
# At least one provider for POST /api/generate
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Optional — quick-copy “Google Drive” link on profile pages
GDRIVE_FOLDER_ID=
```

Manual workflow does not call these keys; only the auto PDF endpoint does.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Run production build |
| `npm test` | Unit tests (`lib/**/*.test.js`) |
| `npm run validate:prompts` | Check second-prompt `{{placeholders}}` |

---

## User workflows

### Auto (`/{slug}`)

Simplified one-click flow when API keys are configured.

1. Open `/{slug}` (e.g. `/jf` for João Franco).
2. Enter **job description**, **role name**, optional **company name**.
3. Click **Generate Resume PDF**.

Server pipeline:

```
profile JSON + JD
  → ATS prompt (lib/build-ats-prompt.js)
  → OpenAI / Claude (lib/ai-service.js)
  → tailored resume JSON (lib/tailored-resume)
  → merge with profile
  → PDF download
```

Link **Manual apply →** switches to the full manual flow.

### Manual (`/manual/{slug}`)

Full apply workflow without server-side AI.

**Step 1 — ATS prompt**

1. Fill role, company, job description, optional application questions.
2. Click **Copy ATS prompt** (`POST /api/manual_prompt`).
3. Paste into ChatGPT; request **JSON only**.
4. Paste the response into **Paste ChatGPT resume JSON**.

**Step 2 — PDF**

1. Live template preview updates when JSON is valid (`POST /api/manual_preview`).
2. Choose template if needed.
3. Click **Download resume PDF** (`POST /api/manual_generate`).

**Step 3 — Second prompts**

1. Pick prompt type (screening, FAQ, recruiter check, technical extraction).
2. **Build & copy** (`POST /api/manual_second_prompt`) for employer questions.

Link **← Auto** returns to the auto page.

---

## Data model

### Profile (`profiles/*.json`)

Base candidate record: contact, employers, dates, education, optional screening defaults, custom keys.

- Template: `profiles/_template.json`
- Loaded by slug via `lib/profile-template-mapping.js` → `lib/load-profile.js`

### Tailored resume (AI / ChatGPT output)

Role-specific JSON merged on top of the profile for PDF and second prompts.

- Schema & validation: `lib/tailored-resume/`
- Example: `profiles/_tailored-resume-template.json`

Required shape:

```json
{
  "title": "Senior Engineer | React | TypeScript",
  "summary": "Paragraph tailored to the job...",
  "skills": {
    "Frontend": ["React", "TypeScript"]
  },
  "experience": [
    {
      "title": "Senior Software Engineer",
      "details": ["Bullet one.", "Bullet two."]
    }
  ]
}
```

Rules enforced before PDF generation:

- `skills`: object with at least one non-empty category array.
- `experience`: non-empty array; each entry needs non-empty `details` strings.
- Do **not** put `company`, `location`, or dates in experience output (profile owns those).
- On PDF generate, `experience` length should match the profile’s work history.

Merge behaviour (`mergeProfileWithTailoredResume`): profile supplies contact and employer metadata; tailored JSON supplies headline, summary, skills, and bullet text per job index.

---

## Adding a profile

1. Copy `profiles/_template.json` → `profiles/Your_Name.json` and fill it in.
2. Add a slug entry in `lib/profile-template-mapping.js`:

```js
"xx": {
  profileFile: "Your_Name",
  template: "Resume-Classic-Charcoal",  // default PDF template id
  prompt: "default"                       // ATS prompt basename (see lib/prompts/ATS Resume Prompts/)
}
```

3. Open `http://localhost:3000/xx` or `/manual/xx`.

---

## Project structure

```
Hunting-Job/
├── profiles/                      # Candidate base JSON (source of truth)
│   ├── _template.json
│   └── _tailored-resume-template.json
│
├── pages/
│   ├── index.js                   # Slug entry
│   ├── [profile].js               # Auto workflow UI
│   ├── manual/[profile].js        # Manual workflow UI
│   ├── preview.js                 # Template gallery
│   └── api/                       # HTTP adapters (thin)
│       ├── generate.js            # Auto PDF
│       ├── manual_prompt.js
│       ├── manual_generate.js
│       ├── manual_preview.js
│       ├── manual_second_prompt.js
│       ├── profiles/[id].js
│       └── ...
│
├── lib/
│   ├── tailored-resume/           # AI output: parse → normalize → validate → merge → PDF data
│   ├── services/                  # auto-generate-service, manual-generate-service
│   ├── workflows/                 # useAutoWorkflow, useManualWorkflow, constants
│   ├── shared/                    # useProfileSession, timer, styles, quick-copy
│   ├── load-profile.js
│   ├── profile-template-mapping.js
│   ├── build-ats-prompt.js
│   ├── ai-service.js
│   ├── pdf-templates/             # React-PDF templates
│   ├── prompts/
│   │   ├── ATS Resume Prompts/    # default.txt, default2–4, final.txt
│   │   └── second-prompts/        # screening, faq, etc.
│   └── components/
│       ├── auto/
│       ├── manual/
│       └── shared/
│
├── scripts/validate-prompt-vars.mjs
├── .gitlab-ci.yml                 # test + validate:prompts + build
└── package.json
```

Legacy re-exports (`lib/resume-json-parser.js`, `lib/merge-profile-resume.js`, etc.) point at `lib/tailored-resume/` for backward compatibility. Prefer importing from `lib/tailored-resume/index.js` in new code.

---

## API routes

| Method | Path | Workflow | Purpose |
|--------|------|----------|---------|
| `GET` | `/api/profiles` | — | List profile files |
| `GET` | `/api/profiles/{basename}` | Both | Load profile JSON |
| `POST` | `/api/generate` | Auto | AI → PDF |
| `POST` | `/api/manual_prompt` | Manual | Build ATS prompt |
| `POST` | `/api/manual_generate` | Manual | Pasted JSON → PDF |
| `POST` | `/api/manual_preview` | Manual | Live/sample PDF preview |
| `POST` | `/api/manual_second_prompt` | Manual | Screening / FAQ prompts |
| `GET` | `/api/templates` | Both | List PDF templates |
| `GET` | `/api/ats-prompts` | Manual | List ATS prompt ids |
| `GET` | `/api/second-prompts` | Manual | List second-prompt types |
| `GET` | `/api/config` | Both | Client config (e.g. Drive folder id) |
| `GET` | `/api/preview` | — | Generic template preview |

Error responses use `{ error, message? }` from `lib/api-response.js`. Invalid tailored resume JSON returns **400** with validation detail.

---

## PDF templates

Registered in `lib/pdf-templates/`. Mapping default per slug is the `template` field in `profile-template-mapping.js`.

Available template ids include: `Resume-Classic-Charcoal`, `Resume-Modern-Green`, `Resume-Tech-Teal`, `Resume-Corporate-Slate`, `Resume-Creative-Burgundy`, `Resume-Executive-Navy`, `Resume-Consultant-Steel`, `Resume-Bold-Emerald`, `Resume-Academic-Purple`, `Resume-Vision-Sage`, `Resume-Vision-Coral`, `Resume-Vision-Midnight`, and `Resume` (fallback).

Preview all templates at `/preview`.

---

## Customising prompts

| Prompt type | Location | Override |
|-------------|----------|----------|
| ATS (step 1) | `lib/prompts/ATS Resume Prompts/*.txt` | Per-slug `prompt` in mapping; UI dropdown on manual page |
| Second (step 3) | `lib/prompts/second-prompts/*.txt` | Optional `lib/prompts/2ndPrompts/` (falls back if empty) |

ATS prompts receive profile variables via `lib/resume-prompt-variables.js`. Every filled ATS prompt also appends the strict JSON schema from `lib/tailored-resume/schema.js`.

Run `npm run validate:prompts` after editing second-prompt templates.

---

## CI

GitLab CI (`.gitlab-ci.yml`) on merge requests and default branch:

1. `npm ci`
2. `npm test`
3. `npm run validate:prompts`
4. `npm run build`

Node **20.x** (see `package.json` `engines`).

---

## Tech stack

- **Next.js 14** — pages + API routes
- **React 18**
- **@react-pdf/renderer** — PDF generation
- **OpenAI** / **Anthropic** — auto workflow only

---

## Licence

Private project (`package.json`: `"private": true`).
