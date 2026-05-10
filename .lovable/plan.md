## Problem

When you tap the collage to open the timeline, each day currently renders as either a single centered polaroid or a 2-col grid / horizontal strip of polaroids. The actual clothesline string + pegs that were supposed to anchor each day are gone, so the timeline feels like a plain card list instead of a hung row of memories.

## Goal

Restore the clothesline-per-day look in `src/routes/moments.tsx > TimelineGroup`: a thin string stretched across the day, with each moment's polaroid hanging under two little pegs.

## Changes (only `src/routes/moments.tsx`)

1. **TimelineGroup layout**
   - Keep the existing day label divider on top.
   - Replace the `!hasStack` / stacked branches with a single clothesline row:
     - A relatively-positioned container with a 1px sage/border line near the top (the string), full width, with a slight horizontal "sag" using a CSS gradient or a thin SVG curve.
     - A horizontally scrollable, snap-x flex row of `MomentCard`s hanging from the string.
   - Each card is wrapped in a `<div>` that adds:
     - Two small peg dots (rounded clay/sage circles, 8–10px) absolutely positioned at the top-left and top-right of the polaroid, sitting on top of the string.
     - A tiny shadow under each peg.
     - Alternating slight rotation (-3°/+2°/-1°) so cards look loosely hung.
   - The polaroid card itself stays as `MomentCard` but rendered with `stacked={false} expanded` size so it's compact and consistent.

2. **Empty-day / single-item handling**
   - Even with one moment, render the clothesline (just one hanging card centered).
   - Drop the "tap to spread / restack" affordance — the row scrolls horizontally instead. Remove the `expanded` toggle state and the "Restack" button.

3. **Sag effect (lightweight)**
   - String: a `<div>` with `border-top: 1px solid hsl(var(--border))` plus a subtle drop using `transform: translateY` per card peg position is overkill — instead, use a single SVG path `M0,8 Q50%,20 100%,8` with `stroke="hsl(var(--border))"` `stroke-width="1"` placed behind the cards. Keep it simple, no animation.

4. **Pegs**
   - Implement as a small subcomponent `Pegs()` returning two absolutely positioned spans:
     - `className="absolute -top-2 left-3 h-2.5 w-2.5 rounded-[3px] bg-clay shadow-soft rotate-12"`
     - mirror on `right-3` with `-rotate-12`.
   - Sits inside the wrapper div above the polaroid; the polaroid gets `mt-4` so the pegs visually clamp the top edge.

5. **No backend, store, or routing changes.** The existing `groupByRelativeDate`, `state.moments`, and the collage → timeline transition stay as-is.

## Out of scope

- The empty-state copy ("Your scrapbook starts with one quiet moment.") — keep as-is.
- Collage view — unchanged.
- Bucket list tab — unchanged.
