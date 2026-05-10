## Goal

When a user opens the **Timeline (clothesline)** view in Moments and has no real entries yet, show a warm, demo clothesline of photos pegged across several days — a Chinese woman quietly spending time with her senior dad in different everyday situations.

## What you'll see

- 6 generated photos, each poignant and tender (not posed/stocky):
  1. Pouring tea for her dad at a small kitchen table, morning light
  2. Helping her dad button his shirt, sitting on the edge of the bed
  3. Holding hands while walking slowly through an HDB void deck garden
  4. Looking at an old photo album together on the sofa, warm lamp light
  5. Sharing a bowl of noodles at a hawker centre, dad smiling faintly
  6. Resting head on dad's shoulder at the hospital bedside, late afternoon

- Pegged across **3 demo days** on the clothesline — labels like "Today", "Yesterday", "3 days ago" — so the user sees the timeline rhythm immediately.

- Each peg has a short, gentle caption (e.g. "Morning tea, the quiet kind" / "He still buttons the top one himself").

- A small "Demo" tag on the cards so it's clear these are sample memories, not real ones.

- The demo automatically disappears the moment the user adds their own first real moment.

## Technical notes

- Generate 6 images into `src/assets/demo-clothesline/` using the imagegen tool (standard quality, photographic, soft natural light, Chinese woman + senior father, Singapore/East Asian context, no text in image).
- New file `src/lib/demo-moments.ts` exports a `DEMO_MOMENTS: Moment[]` array with stable ids, dates offset from `new Date()` (today, yesterday, -3 days), the 6 imported images, titles and notes.
- In `src/routes/moments.tsx`, where the timeline currently renders the "empty" branch (line ~215), if `state.moments.length === 0` use `DEMO_MOMENTS` to feed `groupByRelativeDate` instead, and pass an `isDemo` flag down to `TimelineGroup` / `PeggedCard` so cards render a small "Demo" pill in the corner.
- No DB writes, no changes to `Moment` type, no impact on the public scrapbook share — demo is purely local UI for the empty state.
