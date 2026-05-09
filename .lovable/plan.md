## Redesign `/onboarding` as a calm 3-tile landing

Replace the multi-step onboarding questionnaire with a single, calm screen. The current gradient orb is swapped for the uploaded watercolor "arms hugging heart" illustration, followed by one line of copy and three tappable tiles with line icons.

### Layout (top → bottom, centered, max-w-xl)

1. **Hero illustration** — the uploaded `arms_hugging_heart.png`, ~160px square, centered, soft drop shadow. Replaces the `bg-gradient-dawn` orb.
2. **Headline** — serif, balanced, ~text-4xl:
   "You are not alone. What shall we do today?"
3. **Three tiles** — stacked vertically (single column on mobile, still single column on desktop for calm rhythm), each a full-width rounded card (`bg-card`, `border border-border`, `shadow-soft`, `rounded-2xl`, hover `shadow-paper` + slight lift). Each tile contains:
   - Left: a thin line icon (~32px, `stroke-[1.4]`, muted-foreground) from `lucide-react`
   - Middle: serif title
   - Right: small `ArrowRight` chevron

   | Title | Icon (lucide) | Route |
   |---|---|---|
   | Let me process this a bit more | `Wind` | `/support` |
   | Show me what needs to be done | `ListChecks` | `/care-journey` |
   | Help me relive my memories | `Images` | `/moments` |

4. Subtle footer line: "Move at your own pace." in muted text.

### Behavior

- Each tile is a TanStack `<Link>` to its route — no extra logic.
- Auth gate stays: if no `user`, redirect to `/auth` (same as current OnboardingFlow).
- The `onboarding.completed` redirect is removed so this page is always reachable from `/onboarding`. We mark `onboarding.completed = true` on first mount via `saveOnboarding({ completed: true })` so existing `/` redirects to `/onboarding` no longer loop, and Today page renders normally for users who land on `/`.
- Gentle entry animation: fade + 8px rise on hero, then staggered tiles (0.06s).

### Files

- **Rewrite** `src/components/OnboardingFlow.tsx` — replace entire multi-step flow with the new 3-tile layout. Remove all step state, choice grids, relationship dropdown, headers, illness/emotion/priority arrays.
- **Copy asset** `user-uploads://arms_hugging_heart.png` → `src/assets/arms-hugging-heart.png`, imported as ES6 module.
- `src/routes/onboarding.tsx` — unchanged (still renders `<OnboardingFlow />`).

### What stays the same

- `useAppData`, `saveOnboarding`, auth redirect pattern.
- Route file, route tree, all other pages (`/`, `/support`, `/care-journey`, `/moments`, `/family`, `/auth`).
- Design tokens — uses existing `bg-card`, `border-border`, `shadow-soft`, `font-serif`, `text-muted-foreground`.

### Out of scope

- No DB changes, no new routes, no changes to the Today page or other tiles' destination pages.
