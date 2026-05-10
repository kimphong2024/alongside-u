## Goal

1. Restore a standard login page (email/password sign-up & sign-in, plus Google sign-in).
2. Move every piece of per-user data (moments, bucket list, mood check-ins, care-journey checkboxes) from `localStorage` into the Lovable Cloud database so it persists per user across devices.

## 1. Login page (`src/routes/auth.tsx`)

Replace the Singpass mock with a clean two-tab card:

- **Sign in** — email + password, "Forgot password?" link.
- **Sign up** — email + password (with `emailRedirectTo: window.location.origin`).
- **Continue with Google** button above the form, calling Lovable's managed Google OAuth.
- After successful sign-in/sign-up → `navigate({ to: "/onboarding" })` (3-tile chooser, per existing rule).
- Keep the soft `auth-bg.png` background and serif/italic styling so it matches the rest of the app.
- Add a `/reset-password` route (public) that handles the recovery link and calls `supabase.auth.updateUser({ password })`.
- Remove the Singpass demo logic, the demo-id localStorage trick, and the `singpass-mock.png` import.

Auth settings:
- Enable Google via Lovable's managed OAuth (`configure_social_auth` with `providers: ["google"]`, keep email enabled).
- Leave email confirmation **on** (default) — users must verify before signing in.

## 2. Persistent per-user data (cloud)

Today only `profiles` and `family_members` are in the cloud. `moments`, `bucketList`, `checkInHistory`, and `checkedItems` live in `localStorage`. New tables (all with RLS scoped to `auth.uid() = owner_id`):

- **`moments`** — `id`, `owner_id`, `date`, `title`, `note`, `photo`, `video`, `audio`, `audio_duration`, `created_at`.
- **`bucket_items`** — `id`, `owner_id`, `title`, `category`, `done`, `created_at`.
- **`check_ins`** — `id`, `owner_id`, `date`, `mood`, `created_at`.
- **`checked_items`** — `id`, `owner_id`, `item_key` (text), `checked_at`. Unique `(owner_id, item_key)`.

Each table gets the four standard RLS policies (select/insert/update/delete own rows) and indexes on `owner_id` + the sort column.

Photo/video/audio note: moments currently store base64 data URLs. We'll keep the same approach in a `text` column for now (no Storage bucket) so behavior is unchanged — just persisted server-side. Storage migration can be a follow-up if files get large.

## 3. Refactor `src/lib/store.ts`

Replace the `localStorage` paths with Supabase reads/writes:

- On hydrate: in addition to `profiles` and `family_members`, fetch `moments`, `bucket_items`, `check_ins`, `checked_items` for `user.id`.
- Add CRUD helpers: `addMoment`, `addBucketItem`, `toggleBucketItem`, `addCheckIn`, `toggleCheckedItem`.
- Update the `useAppState()` compatibility shim so existing route code (`moments.tsx`, `support.tsx`, `care-journey.tsx`, `index.tsx`) keeps working — diff family-style logic to detect added/removed/toggled items and fire the matching Supabase calls.
- Remove `loadLocal` / `saveLocal` and the `alongside_local_*` keys.

## 4. Touch points to verify after refactor

- `src/routes/index.tsx` — mood check-in writes go through `addCheckIn`.
- `src/routes/care-journey.tsx` — checkbox toggles go through `toggleCheckedItem`.
- `src/routes/moments.tsx` + `MomentComposer` — saving a moment goes through `addMoment`.
- `src/routes/support.tsx` — bucket list add/toggle/delete go through the new helpers; mood-burnout banner reads from cloud `check_ins`.

## Technical notes

- All DB calls use the browser `supabase` client (publishable key + user session); RLS handles isolation. No edge functions or server functions needed.
- `useAppState` keeps a synchronous in-memory mirror so UI stays optimistic; mutations write through to Supabase in the background.
- `singpass-mock.png` asset can be left in `src/assets/` (unused) or deleted later — not blocking.

## Out of scope

- Migrating existing `localStorage` data into the cloud for current sessions (users will start fresh after sign-in).
- Moving photo/video blobs to Supabase Storage (can do later if base64 in `text` becomes a problem).
