## Remove all em dashes

Replace every em dash (`—`) across the codebase with a regular hyphen surrounded by spaces (` - `). 33 occurrences across 12 files.

### Files affected
- `src/server.ts` (1)
- `src/components/MomentComposer.tsx` (1)
- `src/routes/scrapbook.$token.tsx` (1)
- `src/routes/auth.tsx` (3)
- `src/routes/care-journey.tsx` (2)
- `src/routes/index.tsx` (2)
- `src/lib/content.ts` (5)
- `src/routes/reset-password.tsx` (1)
- `src/routes/__root.tsx` (6 - meta titles/descriptions)
- `src/routes/onboarding.tsx` (1)
- `src/routes/support.tsx` (5)
- `src/routes/moments.tsx` (5)

### Approach
Run a single sed pass replacing `—` with ` - `, then collapse any accidental double spaces around it. No logic changes, copy/meta only.