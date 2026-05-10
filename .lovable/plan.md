## Goal
Make the clothesline at the top of the Moments page display photos uploaded by the user, hung from the pegs as polaroids. The existing photo upload (in the moment composer) already works — we just need to route those photos onto the clothesline.

## Behavior
- **Empty state**: Clothesline shows the current 3 seed family photos (tea, hands, garden) as gentle placeholders so the page never looks bare.
- **After uploads**: As soon as the user adds a moment with a photo, the clothesline replaces the seeds with the user's most recent photo moments (up to 5 polaroids, newest hanging at one end). Each new upload "drops in" with the existing pendulum spring animation and joins the sway loop.
- **Captions**: Use the moment's title as the handwritten caption under each polaroid (truncated to ~24 chars). Falls back to the date if no title.
- **Click a polaroid**: Scrolls down to that moment in the timeline below (smooth scroll to the matching `MomentCard`).
- **Moments without photos**: Skipped on the clothesline (they still appear in the timeline).

## Quick "add photo" affordance
Add a small **"+" peg slot** at the right end of the clothesline (an empty dashed polaroid frame with a peg). Tapping it opens the existing `MomentComposer` pre-focused on the photo picker, so users can upload directly from the clothesline without scrolling to the FAB.

## Technical notes
- `ScrapbookHero` becomes data-driven: accept `photoMoments: Moment[]` and `onAddPhoto: () => void` props instead of hardcoding 3 cards.
- In `Moments`, derive `photoMoments = state.moments.filter(m => m.photo).slice(0, 5)`. If empty, pass the seed array (current 3 hardcoded entries) so the hero still renders.
- Each polaroid `<img src>` uses `moment.photo` (a data URL from `FileReader`, already stored in `state.moments`).
- Animation: keep the existing `initial={{ y: -160 }}` spring + infinite sway. New uploads animate in via `AnimatePresence` keyed by `moment.id`.
- Empty "+" slot: same polaroid frame styling, dashed border, centered `Plus` icon, `onClick={onAddPhoto}` → `setComposerOpen(true)`.
- No backend / schema changes. Photos already persist in `local.moments` via `useAppState`.

## Files
- `src/routes/moments.tsx` — refactor `ScrapbookHero` to accept moments, add empty "+" slot, wire scroll-to-card on polaroid click.