# Changelog

Two sections: an **inferred history** reconstructed from the current codebase (approximate — not a verified release log), and the **latest session** of focused changes.

---

## Inferred history

### 0.1 — Foundation
- TanStack Start v1 scaffold with file-based routing.
- Lovable Cloud (Supabase) wired in: auth, Postgres, RLS.
- Email + password and Google OAuth sign-in.
- Singleton app store (`src/lib/store.ts`) with onboarding persistence.
- Base design tokens in `src/styles.css` (oklch), shadcn/ui components installed.

### 0.2 — Care Journey
- Care Journey checklist content (`src/lib/content.ts`) covering medical, legal, financial and emotional next steps.
- Singapore resource carousel.
- Progress tracking on the checklist.

### 0.3 — Moments
- Moments composer supporting photos, video and audio.
- Bucket list with template ideas.
- `suggest-bucket-ideas` edge function for AI-suggested moments.
- Seeded demo moments to give first-time users something to look at.

### 0.4 — Sharing
- Public scrapbook route `/scrapbook/$token`.
- `public-scrapbook` edge function for token-resolved read-only views.

### 0.5 — Support & Family
- Breath exercise.
- Singapore helpline directory (SOS, AIC, Hospice Council, 995).
- Family member invites.
- `/family` route consolidated under `/support`.

### 0.6 — Onboarding refresh
- Heart illustration introduced as the recurring visual anchor.
- Inline pill-style relationship picker with custom-entry support.
- Emotion options gain line iconography.
- Priorities multi-select added; confirmation screen personalized with caregiver name.

---

## Latest session

- **Onboarding emotions** — added line icons beside each emotion option (Waves, CircleDashed, Wind, Compass, Shield, Sun).
- **Heart logo consistency** — replaced remaining white blob placeholders in `care-journey-intro` with the shared heart illustration.
- **Moments demo handling** — seeded demo moments now clear automatically once the user adds their first real moment, so the timeline reflects only the user's own entries.
- **Care Journey Intro simplification** — removed the diagnosis-type grid (Cancer / Dementia / Heart failure / ALS / Parkinson's / Other) while keeping the header and the stage selector. Dropped the unused `ILLNESSES` constant and removed `illnessType` from the `introDone` gating so returning users aren't blocked.
- **UX writing pass** — toned down repeated consolation language across the app:
  - `care-journey-intro.tsx`: welcome heading, emotional subtitle, post-emotion response, final screen heading and closing line.
  - `index.tsx`: home heading, "Today's focus" label, follow-up copy.
  - `OnboardingFlow.tsx`: welcome-back heading.
  - `moments.tsx`: confirmation toast, loading text, hero subtitle.
  - `care-journey.tsx`: section heading, next-step label, progress label, empty state.
  - `auth.tsx`: tagline and promise line.
- **Documentation** — added `docs/README.md`, `docs/FEATURES.md` and this changelog.
