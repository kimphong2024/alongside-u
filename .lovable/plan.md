## Make the heart visibly ~25% full after the first task

Right now the water level is a true ratio: with many tasks, completing one only fills ~3%, which barely shows. The user wants the first completion to read clearly (~20–30%) and growth from there to remain proportional.

### Change (single spot)

In `src/routes/care-journey.tsx`, `HeartMeter` (around line 712–714):

- Keep the incoming `ratio` for the splash/overshoot trigger and the `checked/total` label as-is.
- Compute a separate `visualR` for the water fill geometry only:
  - If `r === 0` → 0 (empty heart stays empty).
  - Else → `0.25 + 0.75 * r` (so 1 task instantly looks ~25% full, fully complete still reaches 100%).
- Use `visualR` to derive `fillHeight` and `fillY` (replacing the current `r * 24`). Wave visibility (`r > 0 ? "block" : "none"`) keeps using `r`.

No other components or data change.