## Mock Singpass login (UI only)

Real Singpass NDI requires an approved relying-party account, government issued credentials, and a backend OIDC flow with private-key signing. Until you have those credentials, we'll build a **visual-only Singpass sign-in** that mimics the real flow but uses an anonymous/demo session under the hood so the rest of the app still works.

### What changes

**1. `/auth` page (`src/routes/auth.tsx`) — full redesign**
- Remove email/password form and "Continue with Google" button.
- Replace the card with a single, official-looking **"Sign in with Singpass"** button (red Singpass-style brand color, lock icon, "Singpass" wordmark in the recognizable typeface treatment).
- Add small disclaimer text: *"Demo mode — Singpass integration coming soon."*
- Keep the Alongside header, the soft card, and the privacy footer.

**2. Mock auth handler**
- On click, show a brief "Redirecting to Singpass…" loading state (1–1.5s) to mimic the real redirect feel.
- Then sign the user in via a generated demo email/password (`demo-{uuid}@singpass.local`) using existing Supabase auth so the `_authenticated` routes, profiles trigger, and `useAuth` hook keep working unchanged.
- On success, navigate to `/`.

**3. Cleanup**
- Remove the Google OAuth call from `auth.tsx` (the `lovable.auth.signInWithOAuth` import).
- Leave `src/integrations/lovable/` untouched (auto-generated).
- No database changes — existing `profiles` table and trigger continue to work.

**4. When you get real Singpass credentials later**
We'll swap the mock handler for a real OIDC flow implemented as a TanStack server route under `src/routes/api/public/singpass/callback.ts` plus a server function to initiate the auth request with signed JWTs. That's a separate task once credentials are in hand.

### What this gives you
- A polished Singpass-branded login screen you can demo to stakeholders / users today.
- Email + Google fully removed per your request.
- A clean swap point for the real integration later — only the click handler needs to change.
