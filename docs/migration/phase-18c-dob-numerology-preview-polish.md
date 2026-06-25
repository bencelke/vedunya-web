# Phase 18C — DOB + numerology preview visual polish

Premium visual polish for signed-in profile onboarding (Name → DOB → Language → Numerology preview).

## Flutter files inspected (read-only)

- `lib/features/onboarding/onboarding_flow.dart` — step flow, progress, calm tone
- `lib/screens/welcome_auth_screen.dart` — white/gold auth shell
- `lib/screens/login_screen.dart` — centered auth layout
- `lib/core/utils/numerology_service.dart` — personal day presentation reference

Flutter was **not modified**.

## Web files changed

| Area | Files |
|------|-------|
| Shell/layout | `onboarding-shell.tsx`, `onboarding-step-card.tsx`, `mystic-theme.css` |
| Flow | `onboarding-flow.tsx` |
| Inputs | `dob-input.tsx` (three-field), **new** `onboarding-language-picker.tsx` |
| Preview | `onboarding-numerology-preview.tsx` |
| Errors | `onboarding-error-map.ts` |
| i18n | `en.json`, `ru.json` |
| Tests | `phase-18c-dob-numerology-preview-polish.test.ts`, updated `onboarding-parity.test.ts` |

## Visual improvements

- Premium profile onboarding frame (`mystic-profile-onboarding-*`) matching intro/login quality
- Centered gold-tinted panel (~560px max width)
- Vedunya Maria wordmark + Mystic logo in panel header
- Progress dots, back button, language toggle in top bar
- Large numerology number badge (gold circle)
- Language picker with gold selected state + checkmark
- DOB privacy reassurance footer on step 2

## Copy changes (RU/EN)

Updated per Mystic tone: personal name prompt, trustworthy DOB subtitle, practice language titles, rhythm preview headline, focus labels, finish CTA (“Go to today's guidance” / “Перейти к сегодняшней подсказке”), friendly save/validation errors.

## DOB input behavior

Replaced native `type="date"` with Day / Month / Year fields for mobile Safari reliability. Internally normalizes to `YYYY-MM-DD`. Same Phase 18B validation (required, valid date, not future, year ≥ 1900).

## Numerology preview behavior

Uses existing `buildPersonalDayResult` + Phase 17 Mystic content. Shows: number badge, rhythm headline, title, summary, today's focus card. No placeholders or AI language.

## Tests added

`phase-18c-dob-numerology-preview-polish.test.ts` — 12 describe blocks covering copy, DOB fields, language picker, preview structure, loading/errors, shell, routing.

## Manual QA

Dev server verified onboarding message keys render. Full signed-in flow requires test account in incognito.

## Known gaps

- Profile inline DOB edit still uses native date input (out of scope)
- Screenshots not captured in CI environment
