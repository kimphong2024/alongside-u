## Redesign `/auth` to match the official Singpass login screen

Rebuild the auth card to mirror the Singpass UI in the screenshot — a tabbed white card with a QR code panel and a footer links bar — while keeping the mock sign-in behavior under the hood.

### Layout

Single centered white card (`rounded-2xl`, soft shadow, ~420px wide) with three stacked sections:

1. **Tabs header** (top, inside the card)
   - Two tabs: **Singpass app** (active) and **Password login** (inactive).
   - Active tab: red text (`#F4333D`), bold, with a red underline bar.
   - Inactive tab: muted gray, no underline. Clicking it just switches the visible panel — no real password flow (still mock).

2. **QR panel** (main white area)
   - Heading: **"Scan with Singpass app"** (bold) + "to log in" (regular) on the next line, centered.
   - QR code framed by a red rounded square border (`border-2 border-[#F4333D] rounded-2xl`, ~280px).
   - Inside the QR frame: a black-on-white QR-style graphic (use a static SVG/PNG placeholder QR — purely decorative, clicking it triggers the mock sign-in).
   - Centered red icon tile in the middle of the QR (rounded square with the little "person" silhouette, matching screenshot).
   - Singpass wordmark below the QR — lowercase italic-leaning red text with the small black "person" replacing the dot of the "i" (use red text + an inline SVG glyph for the "i" dot).

3. **Footer links bar** (light gray section at bottom of card, `bg-muted/40`, separated by a subtle divider)
   - Two stacked centered links:
     - **Register for Singpass** (underlined, blue/indigo)
     - **Download Singpass app** (underlined, blue/indigo)
   - Both are `<a href="#">` placeholders (no navigation in demo).

### Behavior

- **Click anywhere on the QR** (or auto-trigger after a short delay) → runs the existing mock sign-in flow (`Redirecting to Singpass…` → `Verifying…` → demo Supabase session → `/`).
- **Password login tab**: shows a simple disabled state with text *"Password login is disabled in this demo. Use the Singpass app tab."* — keeps the visual parity without building a second real form.
- Status text (`Redirecting…` / `Verifying…`) renders below the QR, replacing the "Scan with…" heading while busy.
- Existing `useAuth` redirect-if-authenticated logic stays.

### Visuals / tokens

- Card: `bg-card` white, `shadow-soft`, `border border-border`.
- Brand red: `#F4333D` (already used). No new tokens required.
- Footer link color: a muted indigo (`text-[#3B4CCA]`) with `underline underline-offset-2` to match screenshot.
- Background page: keep current page background; remove the big "Welcome." header above the card and the Alongside logo+wordmark above the card so the Singpass card stands alone (matches screenshot framing). Move a small Alongside footer line *below* the card: "Powered by Alongside · Demo mode".

### Files

- **`src/routes/auth.tsx`** — full rewrite of the card. Add a `useState<'app' | 'password'>('app')` for the tab, keep `handleSingpass` as-is, attach it to the QR panel click and auto-trigger via a "Tap QR to continue" affordance.
- **No new files / no DB / no new deps.** QR graphic: inline SVG (random-looking module grid) or a small PNG in `src/assets/`. I'll inline an SVG to avoid asset imports.

### What stays the same

- Mock Supabase demo session, `useAuth`, redirect-on-auth, toast errors.
- All other routes, components, and styles untouched.
