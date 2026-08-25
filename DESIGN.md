# Design

## Theme

Warm paper. The app is a quiet, tactile surface — cream paper ground, soft off-white cards with a subtle grain overlay (`.paper-grain`), warm-brown ink, sage and clay accents. Rounded everything (base radius 1.25rem; cards are `rounded-2xl`/`rounded-3xl`, controls `rounded-full`). Shadows are warm-tinted and soft (`shadow-soft`, `shadow-paper`), never gray or harsh. A `.dark` palette exists but nothing toggles it; light is the shipped experience.

## Color

Source of truth: `src/styles.css` (`:root`). Hex tokens, exposed to Tailwind v4 via `@theme inline` (`bg-card`, `text-clay`, `border-sage/30`, …). Never hardcode raw colors in components.

- Ground: `--background #F6EFE7` (body actually paints `--gradient-hero`: cream with clay/sage radial washes)
- Card: `--card #FAF8F5` · Ink: `--foreground #33251E` · Muted ink: `--muted-foreground #6C6058`
- Border/input: `#E6DDD4` · Muted surface / sand: `#EFE7DD`
- Sage (primary, success, calm): `#8FA88A`, soft `#C7D8C4`; secondary wash `#E7EFE7`
- Clay (warmth, gentle warning): `#C9886F`, soft `#D8B6A4`; destructive `#C97B5E`
- Active accent (nav pill, selected states only): `--accent-active #ED9054`
- Gradients: `bg-gradient-warm` (card→sand vertical), `bg-gradient-sage`, `bg-gradient-dawn`, `bg-gradient-hero`

Usage rules: accent-active for current selection and active nav only. Sage = progress/positive, clay = warmth/attention. State colors stay soft — no saturated alerts.

## Typography

- Serif display: **Cormorant Garamond** (300/400/500 + italics) — all h1–h4 via base layer; page titles usually `font-serif italic font-light text-foreground/90`. Large sizes only; never in buttons, labels or data.
- Sans body/UI: **DM Sans** (300–600) — everything else. Body line-height 1.65.
- Handwriting: **Caveat** (`font-hand`) — reserved for moment notes and scrapbook captions only.
- Eyebrow/section label: `text-xs uppercase tracking-[0.14em] text-muted-foreground` (Today uses a variant with a short rule line). This is the app's one deliberate kicker system.

## Components

- shadcn/ui (Radix) in `src/components/ui/`; actively used: button, input, dialog, textarea, carousel, calendar, sonner toasts.
- Bottom sheets: `src/components/BottomSheet.tsx` (portal + framer slide-up + paper-grain body) — use it, don't re-roll.
- Segmented pill toggles: rounded-full container + `motion.span` with a **unique** `layoutId` (framer layoutIds are global) + `AnimatePresence mode="wait"` pane swap. Canonical: support.tsx, health.tsx.
- Bottom tab bar: `AppShell.tsx` floating rounded-3xl card, 5 tabs, `layoutId="tab-pill"`.
- Cards: `rounded-2xl bg-card border border-border shadow-soft paper-grain p-4..6`. List rows are tappable cards with a trailing ChevronRight.
- Buttons: primary = `bg-foreground text-background rounded-xl h-11/12`; chips = rounded-full bordered pills that fill `bg-foreground text-background` when selected.
- Icons: Lucide, `strokeWidth 1.6` (1.8 small), usually in a 9–10 h/w rounded-full tinted circle.
- Polaroids: `.polaroid-left/right` tilts + `shadow-paper` + `pb-6` chin; captions in `font-hand`.

## Motion

framer-motion throughout. Page transitions: fade/slide in AppShell keyed on pathname. Element entrances: `initial={{opacity:0, y:8..10}}` with small stagger (0.05–0.08s). Springs for physical elements (stiffness 80–500, damping 14–40); sheets use `ease: [0.22, 1, 0.36, 1]`. Motion conveys state (pill moves, pane swaps, hearts fly on completion); no decorative loops except gentle breathing circle. Honor `prefers-reduced-motion`.

## Layout

Single column, `max-w-2xl mx-auto px-5`, generous vertical rhythm (`space-y-6` in-app pages, `space-y-16` on Today). Bottom padding `pb-32` clears the floating tab bar. Mobile-first; 320px must work.
