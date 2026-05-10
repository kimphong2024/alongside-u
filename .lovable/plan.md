## Remove diagnosis grid from care-journey-intro

In `src/routes/care-journey-intro.tsx`, on the "illnessType" step, remove the `Cancer / Dementia / Heart failure / ALS / Parkinson's / Other` grid, while keeping the header ("What diagnosis did your loved one receive?" + subtitle) and the "Where is your {lovedOne} in their diagnosis?" stage selector.

### Changes
- **Step render (line 243)**: delete the `<ChoiceGrid options={ILLNESSES} ... />` line. Leave the `Header` and the stage block intact.
- **canContinue (line 238)**: drop the `!!d.illnessType` requirement so the user can advance from this step (the stage question stays optional, as it already is). Replace with `canContinue: () => true` or remove the field entirely.
- **introDone guard (line 200)**: remove the `&& !!onboarding.illnessType` part so returning users aren't blocked or redirected based on a field that's no longer collected. Use `const introDone = !!onboarding.relationship;` (or a more meaningful completion flag if preferred).
- **Constants (line 27)**: remove the now-unused `ILLNESSES` array to keep the file clean.

No other screens reference `illnessType` for navigation gating beyond what's noted above. The field remains in the store type so any previously saved value is preserved.