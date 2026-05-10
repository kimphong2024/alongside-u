## Copy & UI updates to Care Journey

### 1. Rename category labels
In `src/lib/content.ts` (and the `CATEGORY_ICONS` map in `src/routes/care-journey.tsx`):
- `"Emotional Stabilization"` → `"When you are ready, let's note down what has been happening"`

In `src/routes/care-journey.tsx`:
- Section header `"Singapore resources"` → `"Care resources in Singapore"`

### 2. Add a "Quick Check" alert above the Emotional carousel
Render a soft alert banner (sage/warm tinted, rounded-2xl, with an `(!)` / `Info` icon) directly above the carousel:
> **Quick Check** — if you have had the time to pause and process all of this.

This replaces the carousel item `p1` ("Pause and process emotions"), which becomes the alert instead of a task.

### 3. Trim Emotional carousel to 3 cards
Remove `p1` and `p5` from `CARE_JOURNEY[0].categories[Emotional…].items`. Carousel will show only:
- p2 — Identify one immediate support person
- p3 — Write down doctor's name and contact
- p4 — Gather medical documents

### 4. Add a "Tip" callout below the Emotional carousel
Render a second soft callout (different tint, e.g. `bg-gradient-warm`, rounded-2xl, with a small lightbulb/info icon) underneath the carousel:
> **Tip** — Big decisions today can wait.

This replaces removed item `p5`. Not checkable, just a passive nudge.

### Technical notes
- The category-detection branch in the page (`cat.category === "Emotional Stabilization"`) needs to use the new label string, or we switch to matching on a stable key. Simplest: keep the conditional but update both occurrences (content + route file).
- `EmotionalCarousel` gets two new sibling elements (Quick Check above, Tip below); easiest is to add them inside the `Emotional` branch wrapper rather than inside the component.
- All styling uses existing tokens (`bg-gradient-sage`, `bg-gradient-warm`, `border-border`, `text-foreground/70`) — no new colors.
- No DB or store changes; pure copy + presentation.
