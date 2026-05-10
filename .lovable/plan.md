## Align tiles with title and enlarge title

In `src/components/OnboardingFlow.tsx`:

1. **Bigger title** - bump heading from `text-3xl md:text-4xl` to `text-4xl md:text-5xl lg:text-6xl` so "You are not alone. What shall we do today?" reads as the dominant element.

2. **Edge alignment** - the title currently uses `text-balance` which can shrink its visual width below the tile row. Remove `text-balance` (or wrap it in the same `w-full` block) so the heading spans the full container width, matching the tile grid's left/right edges. Both heading and grid then share the same `max-w-4xl` + `px-5` bounds, so their edges line up.

No other layout changes.