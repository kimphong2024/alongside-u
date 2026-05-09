## Fix polaroid hero overlapping the toggle

**Problem:** In `src/routes/moments.tsx`, the three decorative polaroid cards in `ScrapbookHero` are absolutely positioned at `top: 50%` with `-translate-y-1/2` plus tilt offsets like `translate-y-3`, so the bottom edges of the cards extend below the container and visually overlap the "Memory journal / Bucket list" toggle pill that sits beneath the hero.

**Change (presentation only, single file):**

In `src/routes/moments.tsx` → `ScrapbookHero`:

1. Anchor the polaroid stack to the top of its container instead of vertically centering it:
   - Change card positioning from `top-[50%] ... -translate-y-1/2` to `top-0` (no Y centering).
   - Keep the horizontal centering (`left-1/2 -translate-x-1/2`) and the per-card tilt/offset classes.
2. Resize the hero polaroid container so it fully contains the tallest tilted card and adds clear breathing room before the toggle:
   - Increase height to roughly `h-[300px] md:h-[320px]`.
   - Keep `mb-6` (or bump to `mb-8`) so the toggle sits visibly below, not under, the polaroids.
3. Leave the toggle markup, animations, and all other sections (timeline, bucket list, FAB, voice note) unchanged.

**Result:** The decorative polaroid stack renders fully above the toggle pill with consistent spacing, and the toggle is no longer visually obstructed.
