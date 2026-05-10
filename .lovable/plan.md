## Goal

Refactor `src/routes/care-journey.tsx` so each category type renders with a distinct layout matching the reference mockups, while staying on the existing warm cream + sage palette, serif headings, soft shadows, and rounded-2xl cards already used across the app. No content or data changes — same `CARE_JOURNEY` and `SG_RESOURCES` from `src/lib/content.ts`, same `checkedItems` toggle behavior.

## Layout per category

Map the category name to a renderer:

1. **Emotional Stabilization → horizontal carousel** (ref: modal_1)
   - Embla via existing `@/components/ui/carousel` (already in project).
   - Each item = a tall rounded card (~70% viewport width, snap), gradient background using `--gradient-warm` / sage accent, large serif title, short description underneath, and a small check pill in the corner that toggles `checkedItems[item.id]`. Tap card to expand into a sheet/drawer with `why` + `reassurance`, OR keep the existing in-place expand. Plan: tap = toggle expanded overlay on the card.
   - Free horizontal scroll-snap, no arrows on mobile (arrows shown md+).

2. **Medical Clarity → icon tile grid** (ref: modal_2)
   - 2-column (sm) / 3-column (md+) grid of square cards, white card bg with soft shadow, centered icon (reuse `iconFor` mapping — Stethoscope etc.), title below in medium weight, tiny check dot top-right.
   - Tap opens a `Dialog` with full description / why / reassurance and the check toggle.
   - Icons get a soft tinted circular background using semantic tokens (`bg-sage-soft`, `bg-card`, etc.) — never raw colors.

3. **Family Coordination → keep current vertical accordion** (ref: modal_4)
   - This is exactly what the current UI already does. Extract it into a `<ChecklistAccordion>` renderer and use it as the default for any category not explicitly mapped (covers Practical, Legal, Burnout Prevention, etc.).

4. **Singapore Resources → horizontal "programmes" carousel** (ref: modal_3)
   - Replace the current vertical list. Render `SG_RESOURCES` as a horizontal scroll-snap row of large rounded image-style cards. Since we don't have illustrations, use gradient tiles (alternating `--gradient-warm`, sage-soft, cream) with the resource icon (lucide) large and centered, name underneath the card (outside, like modal_3), description as a smaller line. Card is a link opening the resource URL in a new tab.

## Branding rules

- Only semantic tokens from `src/styles.css` (`--background`, `--card`, `--sage`, `--sage-soft`, `--gradient-warm`, `--shadow-soft`, etc.). No hex / no `text-blue-500`-style classes.
- Serif (`font-serif`) for card titles in carousel/tiles, sans for body, uppercase tracked labels for section headers (matches existing style).
- Rounded-2xl, soft borders (`border-border`), soft shadow on elevated cards.
- Checked state across all layouts uses the same sage tint already used (`bg-sage-soft/40 border-sage/30`) for consistency with the accordion variant.

## Implementation

Edit `src/routes/care-journey.tsx` only:

```text
CareJourney
├── Header + HeartMeter           (unchanged)
├── Phase tabs                    (unchanged)
├── Phase intro card              (unchanged)
└── For each category in phase:
    ├── Section label (icon + uppercase title)
    └── switch(category):
        ├── "Emotional Stabilization" → <EmotionalCarousel items=… />
        ├── "Medical Clarity"         → <MedicalTiles items=… />
        └── default                   → <ChecklistAccordion items=… />  (current UI)
└── Singapore resources → <ResourcesCarousel items={SG_RESOURCES} />
```

New small components live inside the same file (no new files needed): `EmotionalCarousel`, `MedicalTiles`, `ChecklistAccordion`, `ResourcesCarousel`. They all receive the `state.checkedItems` map and the `check(id)` toggle as props, so behavior stays identical.

The dialog for Medical Clarity uses existing `@/components/ui/dialog`. The carousel uses existing `@/components/ui/carousel` with `opts={{ align: "start", dragFree: true }}`.

## Out of scope

- No changes to data shape, store, or routes other than `care-journey.tsx`.
- No new illustrations generated (resource cards use gradients + lucide icons to avoid asset bloat; can be swapped for real illustrations later).
- HeartMeter, phase tabs, and overall page header remain untouched.
