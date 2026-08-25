# Alongside — Documentation

A calm companion app for caregivers in Singapore navigating a loved one's terminal illness. Alongside helps people take the next step — practically, emotionally, and together with family — without the overwhelm.

## Overview

**Audience.** Adult children, spouses, grandchildren, siblings and friends caring for someone recently diagnosed with a serious or terminal illness in Singapore.

**Tone & design ethos.** Quiet, paper-like, generous whitespace. Serif headings paired with Inter body text. Motion is gentle (Framer Motion). Color is restrained and themed entirely through semantic tokens — never hardcoded in components.

**Core flows.**

1. **Auth** — sign in / sign up (email + Google).
2. **Onboarding** — relationship to the loved one, diagnosis stage, current emotional state, priorities.
3. **Today** — the home screen: a small set of suggested cards tailored to the user's state.
4. From Today, the user branches into **Care Journey** (what to do next), **Moments** (what to remember), **Support** (for the caregiver), and **Family** (rolled into Support).

## Technical reference

### Stack

- **Framework:** TanStack Start v1 (file-based routing in `src/routes/`).
- **UI:** React 19, Tailwind v4 (configured via `src/styles.css`), shadcn/ui, Lucide icons, Framer Motion.
- **Build:** Vite 7, deployed to Cloudflare Workers.
- **Backend:** Lovable Cloud (managed Supabase) — auth, Postgres, edge functions, storage.

### Routing map

| Path                  | File                                | Purpose                                                                                     |
| --------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------- |
| `/`                   | `src/routes/index.tsx`              | Today / home, redirects unauthenticated → `/auth` and unfinished onboarding → `/onboarding` |
| `/auth`               | `src/routes/auth.tsx`               | Sign in / sign up, Google OAuth                                                             |
| `/reset-password`     | `src/routes/reset-password.tsx`     | Password reset landing                                                                      |
| `/onboarding`         | `src/routes/onboarding.tsx`         | Two-tile chooser: process feelings vs. show next steps                                      |
| `/care-journey-intro` | `src/routes/care-journey-intro.tsx` | Multi-step intake (relationship, stage, emotion, priorities)                                |
| `/care-journey`       | `src/routes/care-journey.tsx`       | Checklist of next steps + Singapore resources                                               |
| `/moments`            | `src/routes/moments.tsx`            | Capture and remember meaningful moments                                                     |
| `/support`            | `src/routes/support.tsx`            | Breath exercise, helplines, family invites                                                  |
| `/family`             | `src/routes/family.tsx`             | Redirects to `/support`                                                                     |
| `/scrapbook/$token`   | `src/routes/scrapbook.$token.tsx`   | Public read-only view of shared moments                                                     |

### Key modules

- `src/lib/store.ts` — singleton app store with `useAppData` / `useAppState` hooks. Persists onboarding, family, bucket list, moments and check-in history; syncs with Supabase when authenticated.
- `src/lib/content.ts` — Care Journey checklist data and Singapore-specific resource list.
- `src/lib/demo-moments.ts` — seeded demo moments shown to first-time users; cleared automatically once the user adds their own.
- `src/components/AppShell.tsx` — shared chrome (nav, padding, page transitions).
- `src/components/MomentComposer.tsx` — photo / video / audio capture for new moments.

### Backend

**Tables (public schema).** `onboarding`, `family_members`, `bucket_items`, `moments`, plus auxiliary state. RLS is enabled on all user-owned tables and gated by `auth.uid()`.

**Edge functions.**

- `suggest-bucket-ideas` — calls Lovable AI Gateway to generate gentle bucket-list suggestions tailored to the user's onboarding answers.
- `public-scrapbook` — resolves a share token into a read-only set of moments for the `/scrapbook/$token` route.

### Design system

- All color, surface and shadow tokens live in `src/styles.css` and are defined in `oklch`.
- Components consume tokens (`bg-card`, `text-accent-active`, `border-border`…). Never use raw color classes like `bg-white` or `text-black`.
- Heart illustration (`src/assets/arms-hugging-heart.png`) is the recurring visual anchor across onboarding, intro and the final confirmation screen.

### Local development

```
npm install
npm run dev      # vite dev
npm run build    # production build
```

Cloud is auto-provisioned. Do **not** edit `src/integrations/supabase/client.ts`, `src/integrations/supabase/types.ts`, or `.env` — they are managed by the platform.
