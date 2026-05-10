## Make the heart fill more obviously wavy on task completion

The HeartMeter (src/routes/care-journey.tsx, ~lines 712–820) already has two animated wave layers, but the waves are very low-amplitude (~1px) and the rise on completion is a quiet spring — so finishing a task barely reads as "water filling up". Goal: make each completion feel like a clear, splashy water-rise.

### Changes (single file: `src/routes/care-journey.tsx`, `HeartMeter` component)

1. **Bigger, more visible waves at rest**
   - Increase wave path amplitude from ~1u to ~2.5–3u peak-to-trough so the surface visibly undulates.
   - Slightly slow the back wave and keep the front wave faster for a clearer parallax/water feel.
   - Keep the existing two-layer back/front structure and sage colors.

2. **Splash burst on each completion**
   - Track the previous `ratio` with a `useRef`. When `ratio` increases, trigger a short "splash" state (~700 ms).
   - During splash:
     - Temporarily swap the wave paths for higher-amplitude variants (~5–6u) so the surface visibly sloshes, then ease back to the resting amplitude.
     - Animate the rect/wave `y` rise with a spring that overshoots (lower damping, e.g. stiffness 180 / damping 10) so the water bobs past its new level and settles — reading clearly as a fill event.
     - Add a brief heart-scale pulse (1 → 1.06 → 1) and a soft sage glow ring (an extra `<path>` with the heart shape, animated opacity 0 → 0.5 → 0) for emphasis.
   - After the splash window, revert to the calm resting waves.

3. **Make sure it's visible even when the heart shrinks on scroll**
   - The splash effects scale with the SVG, so no extra work — but verify the glow ring stays inside the viewBox.

No changes to data flow, store, or other components. The trigger is purely the `ratio` prop already passed in.

### Acceptance
- Waves are clearly undulating at rest (not nearly flat).
- Checking a task makes the water rise with an obvious slosh/overshoot and a brief heart pulse.
- Unchecking a task drops the level smoothly without a splash (only fills splash on increase).