## Add `/docs` folder with project documentation

Create a `docs/` directory at the repo root containing three markdown files. Each file mixes a stakeholder-friendly overview at the top with a deeper technical section below.

### Files to create

**1. `docs/README.md` — Product & technical documentation**
- Overview: what Alongside is (a calm companion app for caregivers in Singapore navigating terminal illness), audience, design ethos (gentle, paper-like, semantic tokens, Inter + serif).
- Core flows: Auth → Onboarding (relationship, stage, emotion, priorities) → Today home → branches into Care Journey, Moments, Support, Family.
- Technical section:
  - Stack: TanStack Start v1 (file-based routing in `src/routes/`), React 19, Vite 7, Tailwind v4 via `src/styles.css`, Framer Motion, shadcn/ui, Lucide icons.
  - Backend: Lovable Cloud (Supabase) — auth, `onboarding`, `family_members`, `bucket_items`, `moments`, `check_in_history`-style local state synced via `src/lib/store.ts`.
  - Edge functions: `suggest-bucket-ideas` (AI-generated meaningful-moment ideas), `public-scrapbook` (token-shared moments view at `/scrapbook/$token`).
  - Routing map: `/`, `/auth`, `/onboarding`, `/care-journey-intro`, `/care-journey`, `/moments`, `/support`, `/family` (redirects to `/support`), `/reset-password`, `/scrapbook/$token`.
  - Design tokens: defined in `src/styles.css` (oklch); never hardcode colors in components.
  - Key modules: `src/lib/store.ts` (singleton store + Supabase sync), `src/lib/content.ts` (Care Journey checklist + SG resources), `src/lib/demo-moments.ts` (seeded demo content cleared on first user moment).
- Local dev: `npm run dev`, `npm run build`. Cloud is auto-provisioned; do not edit `client.ts`, `types.ts`, or `.env`.

**2. `docs/FEATURES.md` — Feature list**
Grouped, scannable list:
- **Authentication**: email/password sign-in & sign-up, Google OAuth, password reset, session-aware redirects.
- **Onboarding (Care Journey Intro)**: relationship picker (inline pill selector), diagnosis stage, emotional check-in with iconography, priorities multi-select, personalized welcome.
- **Today (Home)**: greeting tuned to time of day and emotional state, suggested cards (subsidies, key questions, moments, family, rest, breath, message).
- **Care Journey**: structured checklist of next steps (medical, legal, financial, emotional), Singapore-specific resources, progress tracking.
- **Moments**: photo / video / audio capture, AI-suggested bucket ideas (Lovable AI Gateway), demo moments auto-cleared once the user adds their own, shareable read-only scrapbook link.
- **Support**: breath exercise, helplines (SOS, AIC, Hospice Council, 995), self-care prompts.
- **Family**: invite family members; `/family` route currently redirects into `/support`'s family section.
- **Public Scrapbook**: tokenized read-only share view via `public-scrapbook` edge function.
- **Design system**: oklch tokens, paper textures, serif headings, motion via Framer Motion, fully responsive.

**3. `docs/CHANGELOG.md` — Inferred history + latest session**
Two top-level sections:

**Inferred history (approximate, reconstructed from current code):**
- `0.1 — Foundation`: TanStack Start scaffold, auth (email + Google), Lovable Cloud wired, onboarding store, base design tokens.
- `0.2 — Care Journey`: checklist content, SG resource carousel, progress tracking.
- `0.3 — Moments`: composer (photo/video/audio), bucket list, demo moments, AI bucket-idea suggestions edge function.
- `0.4 — Sharing`: public scrapbook route + edge function.
- `0.5 — Support & Family`: breath exercise, helplines, family invites, `/family` consolidated under `/support`.
- `0.6 — Onboarding refresh`: heart illustration, inline relationship picker, emotion icons, priorities.

**Latest session:**
- Added line icons beside onboarding emotion options.
- Replaced white blob placeholders with the heart logo throughout intro.
- Moments: adding a user moment now clears seeded demo moments.
- Removed the diagnosis-type grid from `care-journey-intro` (kept stage selector); dropped `ILLNESSES` constant and the `illnessType` gating in `introDone`.
- UX writing pass: toned down repeated consolation language across `care-journey-intro`, `index`, `OnboardingFlow`, `moments`, `care-journey`, and `auth`.

### Notes
- All three files are new; no existing code is modified.
- Keep tone consistent with the product (calm, plain language, no marketing fluff).
- Inferred history is clearly labeled as approximate so it isn't mistaken for a verified release log.