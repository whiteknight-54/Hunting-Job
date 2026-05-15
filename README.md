# Hunting-Job — Job Apply Assistant

Next.js app for ATS-tailored resume PDFs and apply prompts. Two workflows share the same profiles, prompts, and PDF templates:

| Workflow | Route | AI keys required? |
|----------|-------|-------------------|
| **Auto** | `/auto/{slug}` | Yes (OpenAI or Anthropic) |
| **Manual** | `/manual/{slug}` | No — copy prompts into ChatGPT, paste JSON back |

No authentication, no database. Profiles live in `profiles/*.json`. Server logic runs through Next.js API routes only.

---

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), enter a profile slug (e.g. `p1`), then use **auto** or **manual**.

`/{slug}` redirects to `/manual/{slug}`.

### Environment variables (auto workflow)

Create `.env.local`:

```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Optional — Google Drive quick-copy link on profile pages
GDRIVE_FOLDER_ID=

# Optional — GitHub profiles folder (tree URL); used by Review profile → Migrate on GitHub
# Example: https://github.com/whiteknight-54/Hunting-Job/tree/manual_focus_prod/profiles
GITHUB_PROFILES_URL=
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Run production build |
| `npm test` | Unit tests (`lib/**/*.test.js`) |
| `npm run validate:prompts` | Check `{{placeholders}}` in prompt `.txt` files |

---

## Workflows

### Auto (`/auto/{slug}`)

1. Enter **job description**, **role name**, optional **company name**.
2. Click **Generate Resume PDF**.

Pipeline:

```
profiles/*.json + JD
  → raw ATS prompt (lib/prompts/ATS Resume Prompts/*.txt)
  → OpenAI / Anthropic (lib/core/ai.js)
  → tailored JSON (lib/core/resume.js)
  → index merge with profile.experience[]
  → PDF (lib/pdf-templates/)
```

### Manual (`/manual/{slug}`)

**Step 1 — ATS prompt**

1. Fill role, company, job description, optional application questions.
2. **Copy ATS prompt** → `POST /api/manual/prompt`
3. Paste into ChatGPT; request **JSON only**.
4. Paste response into **Paste ChatGPT tailored resume JSON**.

**Step 2 — PDF**

1. Live preview when JSON is valid → `POST /api/manual/preview`
2. Choose template if needed.
3. **Download resume PDF** → `POST /api/manual/generate`

**Step 3 — Second prompts**

1. Pick prompt type (screening, FAQ, etc.).
2. **Build & copy** → `POST /api/manual/manual_second_prompt`

---

## Data model

### Profile (`profiles/*.json`)

Contact, `experience[]` (company, title, dates, location), education, optional `screening` block.

- Template: `profiles/_template.json`
- Slug mapping: `lib/profile-template-mapping.js`
- Loaded via `lib/core/profile.js`

### Tailored resume (ChatGPT / AI output)

Example: `profiles/_tailored-resume-template.json`

```json
{
  "title": "Senior Engineer | React | TypeScript",
  "summary": "Paragraph tailored to the job...",
  "skills": { "Frontend": ["React", "TypeScript"] },
  "experience": [
    { "details": ["Bullet one.", "Bullet two."] }
  ]
}
```

Validation (`lib/core/resume.js`):

- `skills`: object with at least one non-empty category array.
- `experience`: same length as profile jobs; each entry has non-empty `details`.
- Do **not** put company, location, or dates in tailored experience (profile owns those).

**Merge:** profile supplies contact + employer metadata; tailored JSON supplies `title`, `summary`, `skills`, and `experience[i].details` by index.

---

## Adding a profile

1. Copy `profiles/_template.json` → `profiles/Your_Name.json`.
2. Add a slug in `lib/profile-template-mapping.js`:

```js
"p1": {
  profileFile: "Your_Name",
  template: "Resume-Classic-Charcoal",
  prompt: "ats-resum-prompt-1"
}
```

3. Open `/auto/p1` or `/manual/p1`.

---

## Project structure

```
profiles/                          # candidate JSON
lib/
  core/                            # pure logic (import from here)
    profile.js                     # load profiles
    prompts.js                     # read/fill raw .txt prompts
    resume.js                      # parse, validate, merge for PDF
    ai.js                          # OpenAI / Anthropic (auto only)
    pdf.js                         # template resolve + render
    api-response.js                # HTTP helpers
    paths.js
  services/
    ats-prompt.js                  # build filled ATS prompt
    auto-generate-service.js
    manual-generate-service.js
  prompts/
    ATS Resume Prompts/*.txt       # ← edit ATS prompts here
    second-prompts/*.txt           # ← edit second prompts here
  pdf-templates/                   # react-pdf layouts
  components/                      # UI
  workflows/                       # React hooks (auto / manual)
  profile-template-mapping.js      # slug → file, template, default prompt
pages/
  api/                             # thin HTTP handlers
  auto/[profile].js
  manual/[profile].js
  index.js
  [profile].js                     # redirect → manual
  preview.js
scripts/
  validate-prompts.js
```

---

## API routes

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/profiles/{basename}` | Load profile JSON |
| `GET` | `/api/templates` | List PDF templates |
| `GET` | `/api/ats-prompts` | List ATS prompt ids |
| `GET` | `/api/second-prompts` | List second-prompt ids |
| `GET` | `/api/config` | Client config (e.g. Drive folder id) |
| `GET` | `/api/preview?template=` | Generic template preview |
| `POST` | `/api/manual/prompt` | Build ATS prompt |
| `POST` | `/api/manual/preview` | Live/sample PDF preview |
| `POST` | `/api/manual/generate` | Pasted JSON → PDF |
| `POST` | `/api/manual/manual_second_prompt` | Screening / FAQ prompts |
| `POST` | `/api/auto/generate` | AI → PDF |

Errors: `{ error, message? }` from `lib/core/api-response.js`. Invalid tailored JSON → **400**.

---

## Customising prompts (main maintenance surface)

After setup, you mostly edit `.txt` files — no code changes unless you add new placeholders.

| Type | Location | Per-slug override |
|------|----------|---------------------|
| ATS | `lib/prompts/ATS Resume Prompts/*.txt` | `prompt` in mapping; UI dropdown on manual page |
| Second | `lib/prompts/second-prompts/*.txt` | UI dropdown |

**ATS placeholders:** `{{name}}`, `{{experience}}`, `{{jobDescription}}`, `{{questions}}`, `{{roleName}}`, `{{companyName}}`

**Second placeholders:** `{{jobDescription}}`, `{{questions}}`, `{{tailoredResumeContext}}`

Output JSON schema for ATS prompts lives **inside the `.txt` file** (not appended by code).

Run `npm run validate:prompts` after editing prompts.

---

## PDF templates

Registered in `lib/pdf-templates/`. Default per slug: `template` field in `profile-template-mapping.js`.

Preview all at `/preview`.

---

## Tech stack

- **Next.js 14** — pages + API routes
- **React 18**
- **@react-pdf/renderer** — PDF generation
- **OpenAI** / **Anthropic** — auto workflow only

Node **20+** (`package.json` `engines`).

---

## Licence

Private project (`package.json`: `"private": true`).
