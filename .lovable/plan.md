## Restore clothesline collage on Moments page

Restore the Moments landing view to match the uploaded reference: three polaroid photos hanging from pegs on a string, with handwritten captions underneath ("tea on…", "her hands", "spring garden"). Keep current behavior where tapping the collage opens the timeline gallery.

### Changes

**`src/routes/moments.tsx` — `MemoryCollage` component only**

1. Replace the scattered "tossed pile" layout (current `layout` array + rotated motion cards) with a horizontal clothesline:
   - A thin horizontal line (`border-t` with muted color) spanning the container.
   - Three polaroid cards evenly spaced, each hanging slightly below the line with a small peg (rounded clay-colored shape) on top.
   - Slight alternating tilt (~ -3°, +2°, -2°) for a hand-pinned feel.
2. Each polaroid:
   - White card with `paper-grain` + `shadow-paper`.
   - Square-ish photo (4/5 aspect).
   - Caption rendered in serif italic below the photo (e.g. "tea on the porch", "her hands", "spring garden") — matches the reference.
3. Use the existing seed images (`momentsTea`, `momentsHands`, `momentsGarden`) for demo. When the user has their own photos, use the first 3 of `photoMoments` instead, falling back to the seed captions if none exist.
4. Keep the wrapping `<button onClick={onOpen}>` so clicking the collage still navigates to the timeline.
5. Keep the heading block ("Scrapbook" eyebrow + tagline) and the "Add a moment" button below — unchanged.

### Out of scope
- Timeline view, bucket list, composer, demo moments data — untouched.
- No new images generated; reuse existing `moments-tea.jpg`, `moments-hands.jpg`, `moments-garden.jpg`.