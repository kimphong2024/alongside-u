## Goal
Replace the 2-column grid on the "I am a…" relationship step with a single inline sentence — "I am a [pill ▾] to someone recently diagnosed." — where the pill is a dropdown trigger that rolls down a soft animated panel of options (Son, Daughter, Spouse, Grandchild, Sibling, Parent, Friend, Other). Selecting an option fills the pill with the sage-soft shade and gently collapses the panel.

## Scope
Frontend / presentation only. File: `src/components/OnboardingFlow.tsx`. No store, route, or schema changes.

## UX behavior
- The relationship step renders as one flowing sentence wrapping naturally on small screens.
- The pill shows a placeholder ("choose…") when empty, the chosen relationship when selected, with a small chevron that rotates on open.
- Tapping the pill rolls down a rounded panel beneath it (height + opacity transition via framer-motion, ~250ms, easeOut). Options appear as small pills in a flex-wrap row.
- Hovering / focusing an option lightly shades it; selecting it fills with sage-soft, sets the value, then auto-closes the panel after ~150ms so the Continue button becomes active.
- Click-outside and Escape close the panel. Keyboard: Enter/Space toggles, Arrow keys move focus across option pills, Enter selects.
- Reduced-motion: skip the height animation, just fade.

## Visual details
- Pill: rounded-full, border, px-4 py-1.5, inline-flex with chevron; selected state uses `bg-sage-soft border-sage` to match existing tokens.
- Panel: `bg-card border border-border rounded-2xl shadow-soft p-3 mt-3`, max-w matches sentence column.
- Sentence typography stays serif at the same size as the current Header title; subtitle line ("…to someone recently diagnosed.") is folded into the sentence itself, so the separate subtitle is removed for this step only.

## Technical notes
- Add a small local `RelationshipInline` component inside `OnboardingFlow.tsx` (no new files) that takes `value` and `onChange`.
- Use framer-motion `AnimatePresence` + `motion.div` with `initial/animate/exit` on `height: 0 / auto` (via `style={{ overflow: 'hidden' }}`) and opacity.
- Replace only the `relationship` step's `render`; keep its `canContinue` check unchanged.
- Leave all other onboarding steps (illness, emotion, priorities) untouched.
