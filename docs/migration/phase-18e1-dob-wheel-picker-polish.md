# Phase 18E.1 — DOB wheel picker polish

## Old picker problem

The previous DOB input used native `<select>` dropdowns (with a mobile bottom-sheet wrapper). On mobile Safari and PWA, this felt like a wide browser form control — dropdowns could appear across the top of the viewport, broke the premium onboarding card layout, and did not match the calm Mystic aesthetic.

## New wheel picker behavior

Replaced native selects with a custom **iPhone-style wheel selector** inside the onboarding card:

- Three equal-width scroll columns: **Day**, **Month**, **Year**
- CSS `scroll-snap-type: y mandatory` with 44px item height
- Center highlight row with subtle gold tint
- Items above/below fade via gradient overlays and reduced opacity
- Tap/click or scroll to select; arrow keys supported per column
- Scroll-end detection via `scrollend` with debounced fallback for Safari
- Outputs `YYYY-MM-DD` only when the combination passes `dateOfBirthSchema`
- Auto-clamps invalid day/month pairs (e.g. Feb 31 → Feb 28/29)
- Requires user interaction before emitting a value (prevents accidental default date submission)

## Files changed

### New

- `src/features/onboarding/components/dob-wheel-picker.tsx`
- `src/features/onboarding/utils/dob-wheel-picker-utils.ts`
- `src/features/onboarding/tests/phase-18e1-dob-wheel-picker-polish.test.ts`
- `docs/migration/phase-18e1-dob-wheel-picker-polish.md`

### Modified

- `src/features/onboarding/components/dob-input.tsx` — thin wrapper around `DobWheelPicker`
- `src/features/onboarding/components/intro-rhythm-screen.tsx` — removed sheet props
- `src/styles/mystic-theme.css` — wheel grid, viewport, highlight, fade, item styles
- `src/messages/en.json`, `src/messages/ru.json` — concise birth date copy
- Updated tests: `onboarding-parity`, `phase-18a`, `phase-18c`, `phase-18f`, `phase-18g`

## Validation behavior

| Rule | Behavior |
|------|----------|
| Required complete date | `null` / `""` until user adjusts wheels |
| Valid real date | Leap years supported via `daysInMonth` |
| Not future | Blocked by `dateOfBirthSchema` |
| Year ≥ 1900 | Blocked by schema |
| Invalid combos | Day auto-clamped to last valid day of month |
| Output format | `YYYY-MM-DD` via `combineIsoParts` + schema |

## Month labels

- **EN:** Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec
- **RU:** Янв, Фев, Мар, Апр, Май, Июн, Июл, Авг, Сен, Окт, Ноя, Дек

## Integration status

| Surface | Status |
|---------|--------|
| Pre-auth screen 3 (`IntroRhythmScreen`) | Uses `DobInput` → `DobWheelPicker` |
| Signed-in compact onboarding (`OnboardingFlow`) | Uses `DobInput` → `DobWheelPicker` |
| Pre-auth sessionStorage draft | Unchanged — written on valid DOB |
| Numerology preview | Unchanged — appears after valid DOB |
| Auth handoff / profile migration | Unchanged |

## Tests added/updated

**New (`phase-18e1-dob-wheel-picker-polish.test.ts`):**

1. Wheel renders day/month/year columns
2. Outputs `YYYY-MM-DD`
3. EN month labels
4. RU month labels
5. Invalid date clamping / rejection
6. Future date blocked
7. Leap year behavior
8. Pre-auth rhythm screen uses wheel
9. Signed-in onboarding uses wheel
10. No plain `<select>` in active DOB input
11. Overflow-safe grid CSS

**Updated:** onboarding-parity, phase-18a, phase-18c, phase-18f, phase-18g

## Validation results

| Command | Result |
|---------|--------|
| `npm run lint` | Pass (1 pre-existing PWA warning) |
| `npm test` | **778/778 pass** |
| `npm run build` | Pass |

## Manual QA

Automated smoke: `GET /en/onboarding` returns 200 with `Birth date` and `MYSTIC by Vedunya Maria` in HTML.

Full interactive wheel scroll/tap testing in incognito Safari/PWA **not run in this session** — recommended before merge.

## Known gaps

- Not a native iOS `UIDatePicker`; custom scroll-snap wheels on web
- No momentum physics beyond browser default scroll behavior
- Default wheel position (Jun 15, 1990) is visual only until user scrolls
- Legacy `intro-preauth-dob.tsx` still imports `DobInput` but is unwired from active flow
