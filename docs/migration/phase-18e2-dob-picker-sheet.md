# Phase 18E.2 — DOB tap-to-open picker sheet

## Old problem

Phase 18E.1 replaced native `<select>` dropdowns with custom scroll wheels, but the wheels were **always visible** inside the onboarding card. This felt like a static form control rather than a premium date-selection interaction. The year column also listed from the current year downward, so the default visible position could show **2026** — wrong for birth-date UX.

## New closed-field + picker-sheet behavior

### Closed state

- Compact `DobDateField` button inside the card
- Placeholder: **Select your birth date** / **Выберите дату рождения**
- After selection: formatted date (e.g. `July 20, 1984` / `20 июля 1984`)
- Calendar icon + chevron, rounded pill styling, no exposed wheels

### Open state

- Tap field → `DobPickerSheet` opens
- **Mobile/PWA:** bottom sheet with drag handle
- **Desktop:** centered modal panel (`max-width: 28rem`)
- Header: Cancel | Title | Done
- Body: `DobWheelPicker` (Day / Month / Year columns)
- **Cancel** or backdrop / Escape → closes without applying
- **Done** → validates, applies `YYYY-MM-DD`, closes field
- Body scroll locked while open

## Year / default behavior

- `DEFAULT_WHEEL_YEAR = 1990`
- Empty value → wheel draft centers on **Jun 15, 1990** (not current year)
- Year list: current year → 1900
- Future dates blocked by existing `dateOfBirthSchema`

## Validation behavior

Unchanged strict validation via `resolveWheelPickerValue` + `dateOfBirthSchema`:

- Valid real dates only
- No future dates
- Year ≥ 1900
- Leap years supported
- Invalid day/month combos auto-clamp (Feb 31 → Feb 28/29, Apr 31 → Apr 30)

## Preview / button behavior

Unchanged in `IntroRhythmScreen`:

- No preview until valid DOB
- Create account / Log in disabled until `onboardingDobSchema` passes
- Valid DOB → preview + sessionStorage draft (`YYYY-MM-DD`)

## Files changed

### New

- `src/features/onboarding/components/dob-date-field.tsx`
- `src/features/onboarding/components/dob-picker-sheet.tsx`
- `src/features/onboarding/tests/phase-18e2-dob-picker-sheet.test.ts`
- `docs/migration/phase-18e2-dob-picker-sheet.md`

### Modified

- `dob-input.tsx` — orchestrates field + sheet
- `dob-wheel-picker.tsx` — controlled draft wheels (sheet-only)
- `dob-wheel-picker-utils.ts` — `DEFAULT_WHEEL_YEAR`, `formatDisplayDate`, `clampWheelParts`
- `intro-rhythm-screen.tsx`, `onboarding-flow.tsx`, `intro-preauth-dob.tsx`
- `mystic-theme.css` — date field + sheet styles
- `en.json`, `ru.json` — placeholder, cancel labels
- Tests: 18E.1, 18C, 18G, onboarding-parity

## Tests

**New:** `phase-18e2-dob-picker-sheet.test.ts` (16 assertions)

**Updated:** phase-18e1, phase-18c, phase-18g, onboarding-parity

## Validation results

| Command | Result |
|---------|--------|
| `npm run lint` | Pass (1 pre-existing PWA warning) |
| `npm test` | **794/794 pass** |
| `npm run build` | Pass |

## Manual QA

Automated smoke: onboarding route returns 200 with updated copy.

Interactive tap-to-open sheet testing in Safari/incognito **not run in this session**.

## Known gaps

- Custom web wheels, not native iOS `UIDatePicker`
- Sheet uses CSS bottom-sheet on mobile; no drag-to-dismiss gesture beyond backdrop tap
- Legacy `intro-preauth-dob.tsx` updated but unwired from active 3-screen flow
