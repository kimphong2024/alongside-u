## Goal
After login (Singpass), always land on the 3-tile screen — regardless of whether onboarding was previously completed.

## Changes

**1. `src/routes/auth.tsx` — `handleSingpass`**
- Remove the profile lookup that picks between `/` and `/onboarding`.
- Always `navigate({ to: "/onboarding" })` after sign-in succeeds.

**2. `src/components/OnboardingFlow.tsx`**
- Remove the auto-redirect / auto-complete effect that pushes users away. Currently it sets `completed: true` on mount, but it doesn't redirect — so this is fine to leave. The 3 tiles already render here for any logged-in user. No change needed beyond verifying users aren't bounced.

**3. `src/routes/index.tsx` (Today)**
- Today still redirects to `/onboarding` when `!onboarding.completed`, which is fine (it just means visiting `/` while incomplete sends you to tiles). No change required for the login flow itself, since auth now goes directly to `/onboarding`.

## Result
Every successful login routes to `/onboarding` (the 3-tile chooser). Users can still navigate to `/` (Today) afterward via the tiles or nav.