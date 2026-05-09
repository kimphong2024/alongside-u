## Changes

### 1. Flower logo
- Copy `user-uploads://Flower-App_Logo.png` to `src/assets/flower-logo.png`.
- In `src/components/AppShell.tsx`, replace the white gradient circle next to "Alongside" with an `<img>` of the flower logo (h-9 w-9, object-contain). The Link already points to `/`, so tapping the logo returns to Today.

### 2. Navigation bar — 3 tabs only
- In `AppShell.tsx`, change tabs to: **Journey** (`/care-journey`), **Moments** (`/moments`), **Support** (`/support`).
- Remove the "Today" tab (still reachable via the logo) and remove the standalone "Family" tab.

### 3. Merge Family into Support
- Rework `src/routes/support.tsx` into a tabbed/segmented page with two modes:
  - **For you** — existing breathing exercise, reminders, helplines, gentle observation.
  - **From family** — the invite-circle UI and member list currently in `src/routes/family.tsx` (port the form + list + suggested ways to share).
- Intro copy updated to: "Support yourself, or invite family to support you."
- Keep `/family` route as a redirect to `/support` (so old links still work) — implement by rendering a `<Navigate to="/support" />` in `src/routes/family.tsx`.

### 4. Today snapshot card on Journey
- At the top of `src/routes/care-journey.tsx` (above the phase pills), add a small "Today" card showing today's date + a one-line gentle prompt (e.g. last mood from `state.checkInHistory` or a default reassurance). The whole card is a `<Link to="/">` so tapping returns to the Today main page. Styled like the existing `bg-gradient-warm` cards with a subtle Sun icon and chevron.

## Technical notes
- Logo: import as ES6 module (`import flowerLogo from "@/assets/flower-logo.png"`).
- Family→Support merge uses a local `useState<"self" | "family">` segmented control inside Support, styled like the existing phase pill row.
- The redirect file uses `import { Navigate } from "@tanstack/react-router"` to keep the route registered without breaking the generated route tree.
