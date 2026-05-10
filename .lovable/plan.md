## Fix: questionnaire skipped after one page

The welcome chooser at `/onboarding` is showing once, then "Show me what needs to be done" sends you to `/care-journey-intro`, which immediately bounces to `/care-journey`. Result: the user only ever sees one page.

### Root cause
`/care-journey-intro` skips the questionnaire when `onboarding.completed === true`. But many users already have `completed=true` saved from the previous version of the chooser (which auto-marked completion). So the intro redirects away before any of its own steps render.

### Fix (single file: `src/routes/care-journey-intro.tsx`)

Replace the "already done" guard so it only fires when the questionnaire itself has actually been answered, not when the legacy `completed` flag is set:

- Add a helper, e.g. `const introDone = !!onboarding.relationship && !!onboarding.illnessType;` (the two required-to-advance fields from the early steps).
- Change the redirect-to-`/care-journey` line to use `introDone` instead of `onboarding.completed`.
- Keep the final-step `saveOnboarding({ ...data, completed: true })` as-is — it still records overall completion for other places that may read it.

This makes returning users with stale `completed=true` still see the questionnaire on first visit, but anyone who has actually filled it out goes straight to `/care-journey`.

No DB or store changes needed.