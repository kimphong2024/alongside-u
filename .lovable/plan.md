## Add "Continue as Guest" option to auth page

Add a guest sign-in option below the primary "Sign in / Create account" button so visitors can try the app without creating an account.

### Changes

**1. Enable anonymous sign-ins in Lovable Cloud**
- Call `supabase--configure_auth` with `external_anonymous_users_enabled: true` (other settings unchanged: signups stay open, no auto-confirm, HIBP off).

**2. `src/routes/auth.tsx`**
- Add a `handleGuest` function that calls `supabase.auth.signInAnonymously()`, then navigates to `/onboarding` on success (toast on error).
- Below the existing submit button (line 187), add a small ghost-style button: **"Continue as guest"** with a subtle helper line ("No account needed — you can save your work later"). Disabled while `busy`.
- Reuses the same `busy` state to prevent double-submits.

### Notes
- Anonymous users get a real `auth.users` row, so existing RLS policies keyed on `auth.uid()` continue to work for them.
- A future "upgrade to full account" flow (via `supabase.auth.updateUser({ email, password })`) is out of scope for this change.