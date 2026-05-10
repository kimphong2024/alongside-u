## Memories: collage default → timeline on click

### 1. New default: Memory Collage
Replace the current clothesline `ScrapbookHero` + immediate timeline list with a single **collage view** as the default for the Memory journal tab.

- A scattered, overlapping stack of Polaroid-style photo cards (4–8 most recent moments, or seed photos if empty).
- Random tilts (-12° to 12°), slight x/y offsets, layered z-index so cards overlap like the reference image.
- Subtle paper grain + shadow on each card; uses existing `paper-grain`, `shadow-paper`, `bg-card` tokens.
- Caption underneath in serif italic: dynamic tagline based on recency:
  - >0 moments in last 7 days → "A lot happened last week."
  - 1 moment total → "One quiet moment, kept."
  - empty → "Your scrapbook starts with one quiet moment."
- Whole collage is a button → switches to timeline view. Hover: gentle "fanning out" animation hint.
- Small "+ Add a moment" pill below the collage (replaces the "+" slot in the hero).

### 2. Timeline view (on click)
When the user clicks the collage, expand into the timeline feed:
- Same `TimelineGroup` clothesline-per-day implementation already in place — no changes to that component.
- Add a small "← Back to collage" link/button at the top of the timeline view.
- Keep the section header + tagline from the original hero ("Small things, deeply remembered…") above the timeline.

### 3. Tab + state
- Add `journalView: "collage" | "timeline"` local state, defaulting to `"collage"`.
- Bucket-list tab unchanged.
- Composer ("+ Add a moment") still opens via the pill in collage view AND a small button in timeline view.

### Technical notes
- New component `MemoryCollage` in `src/routes/moments.tsx` (or extracted file). Uses `framer-motion` for entry stagger and hover fan-out.
- Keep `ScrapbookHero` for empty-state-only or remove entirely — the collage replaces its role.
- Photo source: same `state.moments` filtered for `photo || video`, fall back to `momentsTea / momentsHands / momentsGarden` seed assets.
- All semantic tokens (`bg-card`, `border-border`, `font-serif`, `font-hand`, `shadow-paper`) — no new colors.
- No DB or store changes.
