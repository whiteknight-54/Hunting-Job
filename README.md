# Hunting-Job — Tailor Resume App (BOC-E)

Next.js app for **ATS-tailored resume PDFs**, apply prompts, and optional Google Drive upload. Built for the BOC-E team workflow: sign in with Slack, pick a candidate profile, then run **Manual** (ChatGPT + paste JSON) or **Auto** (server-side AI).

| Workflow | Route | Server AI keys? |
|----------|-------|-----------------|
| **Manual** | `/manual/{slug}` | No — copy ATS prompt into ChatGPT, paste JSON back |
| **Auto** | `/auto/{slug}` | Yes — OpenAI, Anthropic, or Groq |

Profiles live in `profiles/*.json`. There is no database; business logic runs in Next.js API routes and `lib/`.

**Home:** [http://localhost:3000](http://localhost:3000) — **Tailor Resume App in BOC-E** — Slack sign-in, then enter a profile slug.  
**Shortcut:** `/{slug}` redirects to `/manual/{slug}`.

---

## Features

- **Slack OAuth** — optional but recommended; middleware protects app pages and APIs when `SLACK_CLIENT_ID` is set (see [Authentication](#authentication)).
- **Manual workflow** — ATS prompt → external AI → paste tailored JSON → PDF (preview optional).
- **Auto workflow** — job description + role → AI → PDF in one step; provider/model picker with rough cost hints.
- **13 PDF templates** — react-pdf layouts; per-profile default in `lib/profile-template-mapping.js`.
- **PDF contact toggles** — show/hide phone and LinkedIn on the generated PDF (LinkedIn renders as a clickable link labeled `linkedin`).
- **Google Drive upload** — OAuth refresh token; button becomes **Upload Resume** when configured.
- **Slack activity reports** — optional bot message on each successful PDF (user display name, AI model, prompt, Drive status, JD excerpt).
- **Second prompts** — screening, FAQ, technical experience, recruiter simulation (`.txt` in `lib/prompts/second-prompts/`).
- **Quick-copy panel** — one-click copy of profile contact fields on Manual/Auto headers.
- **In-app help** — `?` modal driven by `lib/help-guide.js`.

---

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign in with Slack (if configured), enter a profile slug (e.g. `jf`), then open **Manual** or **Auto**.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Run production build |
| `npm test` | Unit tests (`lib/**/*.test.js`) |
| `npm run validate:prompts` | Check `{{placeholders}}` in prompt `.txt` files |

**Node 20+** (`package.json` `engines`).

---

## Authentication

When Slack OAuth env vars are set, protection uses a signed session cookie (`hj_session`):

| Layer | What it guards |
|-------|----------------|
| **`middleware.js`** | **App pages** only (`/manual/…`, `/auto/…`, `/preview`, `/{slug}` redirect, etc.) — not `/api/*` |
| **`guardApi`** | **All API routes** except `/api/auth/*` — returns **401** if unsigned |

Public without a session:

- `/` (login landing)
- `/api/auth/*` (OAuth start, callback, session, logout)
- Static assets (`/_next/*`, `/favicon.webp`, `/logo.webp`)

Users sign in on the home page; after login, `returnTo` deep-links (e.g. `/manual/jf`) work automatically.

| Variable | Purpose |
|----------|---------|
| `SLACK_CLIENT_ID` | Slack app client ID |
| `SLACK_CLIENT_SECRET` | Slack app secret (also used to sign session cookies) |
| `SLACK_TEAM_ID` | Only members of this workspace may use the app |
| `SLACK_AUTH_REQUIRED` | `1` (default when client ID is set), or `off` to disable protection locally |

**OAuth redirect URL** (Slack app settings):  
`https://<your-host>/api/auth/slack-callback`  
(e.g. `http://localhost:3000/api/auth/slack-callback` for local dev)

Optional: `SLACK_SESSION_SECRET` — separate cookie signing secret; defaults to `SLACK_CLIENT_SECRET`.

---

## Environment variables

Create `.env.local` in the project root.

### AI (Auto workflow)

```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GROQ_API_KEY=gsk_...

# Optional defaults for Auto (overridable in UI)
AI_PROVIDER=openai
AI_MODEL=gpt-4o-mini
```

At least one provider key must be set for Auto. The UI shows **active / inactive** per provider based on which keys exist.

### Slack sign-in

```env
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
SLACK_TEAM_ID=
SLACK_AUTH_REQUIRED=1
```

### Google Drive (optional)

OAuth user upload (not a service account). When all four are set, generated PDFs upload to the folder and the primary action label becomes **Upload Resume**.

```env
GDRIVE_FOLDER_ID=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
```

Use a one-off OAuth consent flow to obtain `GOOGLE_REFRESH_TOKEN` (scope: `https://www.googleapis.com/auth/drive.file`). A helper script `get-refresh-token.js` exists in the repo — **configure it with your own client ID/secret and redirect URI**; do not commit secrets.

### Slack PDF reports (optional)

Posted after each successful Manual or Auto PDF generation:

```env
# Preferred: Slack Web API
SLACK_BOT_TOKEN=xoxb-...
SLACK_CHANNEL_ID=C...

# Or: Incoming Webhook
SLACK_BOT_URL=https://hooks.slack.com/services/...
# SLACK_WEBHOOK_URL=   (alias)
```

Message format: `*{Slack display name} generate*`, one line for AI / prompt / Drive, then a fenced JD preview.

### Other

```env
# Quick-copy “open profiles folder” link (Review profile → GitHub)
GITHUB_PROFILES_URL=https://github.com/org/repo/tree/main/profiles
```

---

## UI defaults (Manual settings)

Stored in the browser (`localStorage`). New users (no saved prefs) get:

| Setting | Default |
|---------|---------|
| Quick-copy panel | On |
| ATS prompt preview | Off |
| PDF preview | Off |
| Screening section | Off |
| PDF → Phone | Off |
| PDF → LinkedIn | On (clickable **linkedin** link in header) |

Change anytime via **⚙ Settings** on Manual (layout + PDF contact under PDF preview) or **⚙ AI settings → PDF contact** on Auto.

---

## Workflows

### Manual (`/manual/{slug}`)

1. Enter **role**, **company**, **job description**, optional application questions.
2. **Copy ATS prompt** → paste into ChatGPT (or similar); request **JSON only**.
3. Paste response into **Tailored resume JSON**.
4. **Download Resume** or **Upload Resume** (if Drive is configured).

Optional:

- Turn on **PDF preview** in settings for live layout (`POST /api/manual/preview`).
- Turn on **Screening section** for second prompts (`POST /api/manual/manual_second_prompt`).

### Auto (`/auto/{slug}`)

1. Enter **job description**, **role name**, optional **company**.
2. Open **⚙ AI settings** — choose **Provider** and **Model** (id : price : speed).
3. **Generate Resume PDF** — AI tailors JSON, merges with profile, renders PDF.

Pipeline:

```
profiles/*.json + JD
  → ATS prompt (lib/prompts/ATS Resume Prompts/*.txt)
  → OpenAI / Anthropic / Groq (lib/core/ai.js)
  → tailored JSON (lib/core/resume.js)
  → mergeForPdf (profile jobs + tailored title/summary/skills/bullets)
  → PDF (lib/pdf-templates/)
  → optional Google Drive upload + optional Slack report
```

---

## Data model

### Profile (`profiles/*.json`)

Contact fields, `experience[]` (company, title, dates, location), education, optional `screening` block.

- Template: `profiles/_template.json`
- Slug mapping: `lib/profile-template-mapping.js`
- Loaded via `lib/core/profile.js`

### Tailored resume (AI / ChatGPT output)

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

**Merge:** profile supplies contact + employer metadata; tailored JSON supplies `title`, `summary`, `skills`, and `experience[i].details` by index. PDF contact flags can omit phone and/or LinkedIn.

---

## Adding a profile

1. Copy `profiles/_template.json` → `profiles/Your_Name.json`.
2. Add a slug in `lib/profile-template-mapping.js`:

```js
jf: {
  profileFile: "Joao_Franco",
  template: "Resume-Classic-Charcoal",
  prompt: "prompt-1", // basename of lib/prompts/ATS Resume Prompts/prompt-1.txt (no .txt suffix)
},
```

Use `profileFile` (preferred). Legacy entries may still use `resume`; both resolve to `profiles/{basename}.json`.

3. Open `/manual/jf` or `/auto/jf`.

---

## Project structure

```
profiles/                          # candidate JSON
lib/
  core/                            # pure logic
    profile.js, prompts.js, resume.js, ai.js, ai-config.js
    pdf.js, pdf-filename.js
    google-drive.js                # Drive OAuth upload
    slack-auth.js, slack-auth-config.js
    session-cookie.js, verify-session-cached.js, guard-api.js, require-slack-session.js
    server-cache.js, http-cache.js
    api-response.js, paths.js
  services/
    ats-prompt.js
    auto-generate-service.js
    manual-generate-service.js
    pdf-drive-upload.js
    slack-report.js
  prompts/
    ATS Resume Prompts/*.txt
    second-prompts/*.txt
  pdf-templates/                   # react-pdf + ContactHeader (LinkedIn link)
  components/                      # Manual, Auto, shared UI
  workflows/                       # useManualWorkflow, useAutoWorkflow
  shared/                          # pdf-contact-prefs, useProfileSession, …
  profile-template-mapping.js
  help-guide.js
pages/
  index.js                         # Slack login + profile slug entry
  manual/[profile].js
  auto/[profile].js
  [profile].js                     # → /manual/{slug}
  preview.js                       # template gallery
  api/
    auth/                          # slack, slack-callback, session, logout
    manual/                        # prompt, preview, generate, second prompts
    auto/generate.js
    config.js, profiles/[id].js, templates.js, …
middleware.js                      # Slack session gate (pages only)
scripts/
  validate-prompts.js
```

---

## API routes

Protected by `guardApi` when Slack auth is enforced (returns 401 if not signed in).

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/auth/session` | Current Slack user (public when auth off) |
| `GET` | `/api/auth/slack` | Start Slack OAuth |
| `GET` | `/api/auth/slack-callback` | OAuth callback |
| `POST` | `/api/auth/logout` | Clear session |
| `GET` | `/api/profiles/{basename}` | Load profile JSON |
| `GET` | `/api/templates` | List PDF templates |
| `GET` | `/api/ats-prompts` | List ATS prompt ids |
| `GET` | `/api/second-prompts` | List second-prompt ids |
| `GET` | `/api/config` | Drive, GitHub URL, AI key status |
| `GET` | `/api/preview?template=` | Generic template preview |
| `POST` | `/api/manual/prompt` | Build ATS prompt |
| `POST` | `/api/manual/preview` | Live/sample PDF preview |
| `POST` | `/api/manual/generate` | Pasted JSON → PDF (+ optional Drive) |
| `POST` | `/api/manual/manual_second_prompt` | Screening / FAQ prompts |
| `POST` | `/api/auto/generate` | AI → PDF (+ usage headers, Drive, Slack) |

**Generate body (optional):** `showPhone` (boolean), `showLinkedin` (boolean) — see [UI defaults](#ui-defaults-manual-settings).

Errors: `{ error, message? }` from `lib/core/api-response.js`. Invalid tailored JSON → **400**.

---

## Customising prompts

Main maintenance surface: edit `.txt` files, then `npm run validate:prompts`.

| Type | Location | Per-slug override |
|------|----------|-------------------|
| ATS | `lib/prompts/ATS Resume Prompts/*.txt` | `prompt` in mapping; UI dropdown on Manual |
| Second | `lib/prompts/second-prompts/*.txt` | UI dropdown |

**ATS placeholders:** `{{name}}`, `{{experience}}`, `{{jobDescription}}`, `{{questions}}`, `{{roleName}}`, `{{companyName}}`

**Second placeholders:** `{{jobDescription}}`, `{{questions}}`, `{{tailoredResumeContext}}`

The JSON schema for ATS output is defined **inside each ATS `.txt` file** (not appended by code).

---

## PDF templates

Registered in `lib/pdf-templates/index.js`. Default per slug: `template` in `profile-template-mapping.js`.

Header contact line: `email • phone • location •` [**linkedin**](url) (phone/LinkedIn optional via settings).

Preview all layouts at `/preview`.

---

## Performance notes (Vercel)

**Client**

- Login and profile pages render immediately; profile JSON + config load in parallel (`useProfileSession`).
- Debounced prefetch of `/manual/{slug}` + profile API while typing a profile id on the home page.
- `sessionStorage` caches config, catalogs, and profile JSON (`lib/shared/client-cache.js` — bump `APP_DATA_VERSION` on deploy when response shapes change).
- Manual page lazy-loads preview, screening, and modals; `SlackAccountMenu` loads only when signed in.

**CDN / HTTP**

- **Template list API** (`/api/templates`) uses `lib/pdf-templates/catalog.js` only — no react-pdf import.
- **List + config GET** set `Cache-Control` (`lib/core/http-cache.js`); profile GET uses `private` browser cache.
- **PDF generate/preview** loads one template at a time via dynamic `import()` in `lib/pdf-templates/load-template.js`.

**Server (warm lambda — per instance, not global)**

- `lib/core/server-cache.js` — in-memory profile JSON and prompt file reads (TTL minutes–hours).
- `lib/core/verify-session-cached.js` — short-lived cache for valid Slack session HMAC checks.
- Resolved PDF template components stay loaded in `load-template.js` for repeat PDFs on the same instance.
- Middleware skips `/api/*` so APIs are not double-authenticated (pages still use middleware).

**Heavy CPU (expected)**

- Auto PDF (`POST /api/auto/generate`) — external AI + react-pdf.
- Manual PDF / preview — react-pdf render.

---

## Tech stack

- **Next.js 14** — Pages Router, API routes, middleware
- **React 18**
- **@react-pdf/renderer** — PDF generation
- **OpenAI SDK** — OpenAI + Groq (OpenAI-compatible base URL)
- **Anthropic SDK** — Claude models
- **googleapis** — Drive upload via OAuth refresh token

---

## Licence

Private project (`package.json`: `"private": true`).
