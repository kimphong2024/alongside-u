## Goal

Make logout reachable from every page, not just the home screen.

## What you'll see

In the top-right of the app header (the "Alongside" bar that appears on Journey, Moments, Support, and Today), a small log-out icon button will appear when you're signed in. Tapping it signs you out and returns you to the login screen, with a brief "Signed out" toast.

It will be quiet and unobtrusive — icon only on small screens, icon + "Log out" label on wider screens — so it doesn't compete with the page content.

## Technical notes

- Edit only `src/components/AppShell.tsx`.
- Use existing `useAuth()` hook + `signOut()` from `src/hooks/use-auth.ts` (no new auth code).
- Render the button only when `user` is present.
- Use `LogOut` icon from lucide-react, ghost styling consistent with the app.
- After `signOut()`, navigate to `/auth` with `useNavigate` and show a `toast.success("Signed out")`.
- Remove the now-redundant logout button on `src/routes/index.tsx` to avoid duplication.
