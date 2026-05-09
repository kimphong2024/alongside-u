## Execute feedback from `Alongside_feedback_1.docx`

Six changes across two pages.

---

### Moments page (`src/routes/moments.tsx`)

**1. Replace scrapbook hero cards with poignant family watercolors**
Generate three real watercolor images (saved to `src/assets/`) at premium quality, in the existing warm/sage palette. Each replaces one of the inline SVGs (`PorchArt`, `HandsArt`, `GardenArt`):
- `moments-tea.jpg` — two pairs of hands holding teacups on a porch table, soft watercolor, warm light
- `moments-hands.jpg` — close-up of an elderly hand resting in a younger hand, gentle watercolor wash
- `moments-garden.jpg` — soft watercolor garden in spring bloom with a quiet bench
Replace the three `<svg>` art components with `<img>` tags using the new assets. Captions stay ("tea on the porch", "her hands", "spring garden").

**2. Polaroid micro-interactions: pegs + clothesline**
Re-style the hero section so the three polaroids look like they're hanging from a clothesline:
- Add a thin horizontal line (1px sage/border color, slight droop via SVG curve) across the hero behind the cards.
- Each polaroid gets a small peg (tiny `div` shape, ~10x14px, clay color) at its top-center, slightly rotated to match the card's tilt.
- Entry animation: each polaroid drops from above with a gentle pendulum sway — `initial: { y: -120, rotate: 0, opacity: 0 }` → `animate: { y: 0, rotate: <tilt>, opacity: 1 }` with `type: "spring", stiffness: 60, damping: 8` and staggered `delay: i * 0.18`. After settle, a subtle infinite sway (`±0.5deg`, 4s) so they feel alive.
- Hover: stronger sway + slight lift (already partially present).

**3. Move "Add a moment" button inline (empty state)**
- Replace the empty-state copy block with a centered CTA: keep the headline and "Tap below…" line, then render a real `<Button>` directly underneath that opens the composer (same handler as the floating FAB).
- Keep the floating FAB ONLY when the journal already has moments (so users with content can still add quickly while scrolling). When `timeline.length === 0` and `tab === "journal"`, hide the floating FAB.

---

### Care Journey page (`src/routes/care-journey.tsx`)

**4. Remove the "Today · A small moment…" link card**
Delete the entire `<Link to="/">…</Link>` block (lines 46–64). The page no longer references the Today shortcut.

**5. Add a heart "completion meter" next to the page title**
Right of the `A gentle path forward` headline (same row, flex), render a small heart that fills with a sage gradient based on `completedRatio = checkedCount / totalItemsAcrossAllPhases`.
- Implementation: an inline SVG heart (~36px). Two paths: a muted outline + a clipped fill that uses `clipPath` with a rect whose height = `ratio * 100%` from the bottom. Below the heart, tiny text "`{checkedCount}/{totalCount}`".
- Compute totals from `CARE_JOURNEY` (sum of `phase.categories[*].items.length`) and `state.checkedItems`.

**6. Compact layout + line icons per category, fit in first fold**
- Tighten vertical spacing of the page: `space-y-6` → `space-y-4`, headline `mt-1.5` → `mt-1`, phase header card padding `p-5` → `p-4`, card spacing `space-y-2` → `space-y-1.5`, item card padding `p-4` → `px-4 py-3`.
- Map each category name to a `lucide-react` line icon (stroke 1.5):
  - `Family Coordination` → `Users`
  - `Medical & Care` → `Stethoscope`
  - `Practical & Legal` / `Legal & Admin` → `FileText`
  - `Emotional & Spiritual` → `Heart`
  - `Daily Life` / `Routines` → `Sun`
  - `Memory & Legacy` → `BookOpen`
  - default → `Sparkles`
- Render the icon to the left of the small uppercase category title (`text-xs uppercase tracking-[0.14em]`) inside a tiny rounded container. Keep "Singapore resources" section as-is.
- Default the description preview line under each item to off (only show on expand) to reduce vertical cost. Keep the existing chevron + accordion behavior.

---

### What stays the same

- Routes, route tree, store schema, RLS, design tokens.
- Onboarding page, auth page, today/index page, family page, support page.
- All copy in unchanged sections.

### Out of scope (not in feedback)

- No new tabs, no new data tables, no new dependencies.
- No mobile FAB redesign on Care Journey.

### Files touched

- `src/routes/moments.tsx` (cards → imgs, clothesline + peg, drop animation, empty-state CTA + conditional FAB)
- `src/routes/care-journey.tsx` (remove Today card, add heart meter, line icons per category, tighter spacing)
- `src/assets/moments-tea.jpg`, `src/assets/moments-hands.jpg`, `src/assets/moments-garden.jpg` (new, generated)
