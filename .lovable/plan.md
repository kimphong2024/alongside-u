## Bring back the questionnaire onboarding before /care-journey

When the user picks "Show me what needs to be done" on the welcome screen, run the original multi-step questionnaire (relationship → diagnosis → emotional state → priorities → final) before landing on /care-journey. After they finish it once, future clicks go straight to /care-journey.

### Changes

**1. New route `src/routes/care-journey-intro.tsx`**
- Ports the questionnaire from the STOCK project's `OnboardingFlow.tsx` (welcome, relationship, illness/stage, emotional, priorities, final), wired to the existing `useAppData` / `saveOnboarding` (the store already has all matching fields).
- On finish: `saveOnboarding({ ...data, completed: true })` then `navigate({ to: "/care-journey" })`.
- On mount: if `onboarding.completed` is already true, redirect immediately to `/care-journey` so it only runs once.
- Includes `RelationshipInline`, `ChoiceGrid`, `Header` helpers and the same step indicators / Back / Continue chrome.

**2. `src/components/OnboardingFlow.tsx` (the welcome 2-tile screen)**
- Change the "Show me what needs to be done" tile's `to` from `/care-journey` to `/care-journey-intro`.
- Remove the side-effect that auto-marks `onboarding.completed = true` on mount, so completion now means "finished the questionnaire". The `/support` tile path is unaffected.

**3. No DB changes** - all questionnaire fields already exist on `profiles` and in `OnboardingData`.

### Notes
- The "Let me process this a bit more" tile keeps going straight to `/support` (no questionnaire).
- A user who has already completed the questionnaire will not see it again; the intro route just forwards them to `/care-journey`.