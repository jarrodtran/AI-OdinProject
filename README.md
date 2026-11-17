# The AI Odin Project

A free, open-source **AI Product Management** learning platform modeled after The Odin Project.

**Live app:** [ai-odin-project.vercel.app](https://ai-odin-project.vercel.app)

## What's inside

- **3 learning paths · 15 courses · 36 modules**: *Foundations*, *AI Product Strategy & Growth*, and *Technical AI PM*, each with quizzes, assignments and portfolio projects.
- **10 interactive browser simulators**: Token Economics, Prompt Spec Sandbox, Eval Studio, Hybrid RAG Debugger, Agent Reliability, AI-Native PRD Studio, Multimodal & Voice Latency, Incident War-Room, Cascade Model Router, and AI Pricing & Margin Stress-Tester.
- **AI PM Playbook (`/playbook`)**: 10 Markdown templates, 6 decision matrices, 6 AI-native product teardowns, 16 interview blueprints and 45 glossary entries.
- **Progress that follows you**: progress is always saved in the browser. Optionally sign in with GitHub or Google to back it up privately and sync across devices. You can also export a Markdown portfolio dossier or a JSON backup.

## Local development

Requires Node.js 22+.

```bash
npm install
npm run dev        # http://localhost:3000
```

The site works fully with no configuration; progress is stored in the browser and the sign-in
buttons are hidden. To try cloud sync locally, copy `.env.example` to `.env.local` and fill in an
`AUTH_SECRET` plus at least one OAuth provider. In development, synced progress is written to
`.data/progress.json` (git-ignored).

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Regenerate the lesson index, then production build |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit and curriculum-integrity tests |
| `npm run generate:index` | Rebuild `src/data/lessonIndex.generated.ts` after editing lessons |

## Project layout

```
src/
  app/                    Routes (lesson and path pages are statically generated)
    api/auth/             Auth.js (GitHub, Google) sign-in routes
    api/progress/         GET / PUT / DELETE the signed-in user's progress
  components/             UI, Modal, AuthModal, SearchModal
  components/labs/        One file per simulator, lazy-loaded
  context/ProgressContext.tsx   Local progress + cloud sync
  data/catalog.ts         Paths, courses, labs and the lightweight lesson index (client-safe)
  data/curriculum.ts      Full lesson content (server only)
  lib/progress.ts         Progress model: validation, merge, limits
  lib/progressStore.ts    Upstash Redis store (production) / local file store (dev)
tests/                    Vitest suites
```

**Editing lessons:** lesson content lives in `src/data/curriculum.ts`. Client components import
`src/data/catalog.ts`, which carries only lesson summaries, so full lesson text is never shipped
in page bundles. After changing a lesson's title, summary, skills, course or lab, run
`npm run generate:index` (the build does this automatically; a test fails if it's stale).

## Deploying (Vercel)

1. **Storage:** add **Upstash Redis** from the Vercel Marketplace. It sets `KV_REST_API_URL` and
   `KV_REST_API_TOKEN`. Without it, production sync requests return `503` rather than losing data.
2. **Sign-in:** create a GitHub OAuth app and/or a Google OAuth client with callback URLs
   `https://<your-domain>/api/auth/callback/github` and `/api/auth/callback/google`, then set
   `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`.
   Only providers with credentials are shown.
3. Optional: `NEXT_PUBLIC_SITE_URL` for canonical URLs if you use a custom domain.

## How sync works

- Each signed-in user has one record `{ state, revision, updatedAt }` keyed by their verified
  provider account, never by a typed email.
- Saves replace the stored copy, so un-completing a lesson or clearing a note sticks.
- Every save sends the revision it was based on. If another device saved first, the server
  answers `409` with its copy; the browser merges both and retries.
- Guest progress is merged into your account the first time you sign in on a device.

## License

[MIT](LICENSE)
