# Phase 17 — Numerology onboarding parity

Mystic-style DOB onboarding and deterministic numerology for Vedunya Web.

## Flutter files inspected (read-only)

| File | Purpose |
|------|---------|
| `lib/features/onboarding/onboarding_flow.dart` | Name → DOB → Preview → Account/Enter |
| `lib/core/utils/numerology_service.dart` | Life path, personal year/month/day chain |
| `lib/services/daily_guidance/personal_day_numerology_service.dart` | Sujok personal day for Today |
| `lib/data/numerology_meanings.dart` | Life-path / number titles (EN/RU) |
| `lib/data/daily_guidance/personal_day_guidance_dataset.dart` | Personal day 1–9 copy (EN/RU) |
| `lib/services/daily_guidance/daily_guidance_loader.dart` | `loadOnboardingPreview` |
| `lib/core/utils/personal_day_utils.dart` | Digit reduction helpers |
| `test/numerology_service_test.dart` | Formula constraints |

Flutter was **not modified**.

## Formulas ported

| Output | Flutter source | Web implementation |
|--------|----------------|-------------------|
| Sujok personal day (1–9) | `PersonalDayNumerologyService` | `calculate-personal-day.ts`, `numerology-engine.ts` → `sujokPersonalDayFromIsoDates` |
| Life path | `numerology_service.lifePath` | `numerology-engine.ts` → `lifePathFromIsoDate` |
| Personal year / month / chain day | `numerology_service` | `numerology-engine.ts` |

Today and onboarding preview use **Sujok personal day** (same as Flutter Oracle/Today pipeline).

## Text / content ported

- EN/RU personal day 1–9: `personal-day-content.en.ts`, `personal-day-content.ru.ts` (from `personal_day_guidance_dataset.dart`)
- Structured export: `numerology-content.ts` → `numerologyMeanings`

## Profile Firestore contract

| App field | Firestore field | Notes |
|-----------|-----------------|-------|
| `displayName` | `users/{uid}.displayName` | Required for completion |
| `dateOfBirth` | `user_private/{uid}.dob` (Timestamp) | Normalized as `YYYY-MM-DD` in app code |
| `language` | `users/{uid}.language` | `"en"` \| `"ru"` |
| `profileComplete` | both collections | **Derived** in `getProfileSnapshot` via `deriveProfileComplete()` — true only when name + valid DOB + language exist |

No duplicate `birthDate` / `dob` fields in app types; Firestore write path remains `dob`.

## Onboarding flow

**Signed out:** white intro onboarding (`IntroOnboardingGate`) → login/register (unchanged).

**Signed in, incomplete profile:** `/onboarding` — 4 steps:

1. Name  
2. Date of birth (validated, not future, year ≥ 1900)  
3. Language  
4. Numerology preview (deterministic personal day + focus) → save → Today  

**Signed in, complete:** `/` and `/today` → Today.

## Route gating

- `isProfileComplete()` used on `/`, `/onboarding`, `/today`, `require-user.ts`
- Signed-in incomplete users hitting `/today` redirect to `/onboarding` (server redirect, no client loop)
- Auth loading unchanged (`sessionReady` on finish button)

## Today behavior

- Complete profile + DOB → personal day card via `loadDailyGuidance`
- Incomplete (edge case / anonymous) → CTA; `missingBirthDate` copy when DOB absent

## Tests added

- `src/features/numerology/tests/phase-17-numerology-onboarding.test.ts`
- Updated `src/features/onboarding/tests/onboarding-parity.test.ts`
- Existing `personal-day-parity.test.ts` Sujok fixtures retained

## Manual QA

Run `npm run dev` and verify:

| Scenario | Expected |
|----------|----------|
| A. Signed-out `/ru` | White intro onboarding |
| B. Login new user | Profile onboarding (name first) |
| C. DOB step | Preview shows personal day number + copy |
| D. Finish | Today opens with numerology |
| E. Complete user `/ru` | `/ru/today` |
| F. Incomplete `/ru/today` | Redirect `/ru/onboarding` |
| G. Idle `/ru/today` 90s | No reload loop |

## Known gaps

- Onboarding preview shows numerology only (not full moon/rune preview like Flutter `DailyGuidanceLoader.loadOnboardingPreview`)
- Life path titles from `numerology_meanings.dart` not shown on web preview (personal day only)
- Profile personal details edit uses native date input (no segmented picker)
