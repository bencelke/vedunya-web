# Phase 18B — Account → DOB profile onboarding gate

Enforces Mystic-style profile onboarding (name, DOB, language, numerology preview) before Today.

## Why DOB was missing or skipped before

Phase 17 added the numerology engine and four-step signed-in onboarding, but gaps remained:

1. **Shell display names** (`Mystic member`, `Vedunya Maria member`) could count as a valid name, letting bootstrap-only users appear “complete” without real profile data.
2. **`/api/auth/profile-status`** read the stored boolean instead of always deriving completion from fields.
3. **Register handoff** relied on the same profile check as login instead of always routing new accounts to onboarding.
4. **DOB step default** pre-filled a date (~28 years ago), allowing users to advance without consciously choosing DOB.
5. **Profile personal details** showed `—` for missing DOB without a clear CTA back to onboarding.

## Flutter files inspected (read-only)

- `lib/features/onboarding/onboarding_flow.dart`
- `lib/core/utils/numerology_service.dart`
- `lib/services/daily_guidance/personal_day_numerology_service.dart`
- `lib/data/numerology_meanings.dart`
- `lib/data/daily_guidance/personal_day_guidance_dataset.dart`
- `lib/core/utils/user_profile_local.dart` — local DOB storage pattern
- `lib/core/i18n/strings.dart` — numerology / DOB copy

Flutter was **not modified**.

## Web files changed

| Area | Files |
|------|-------|
| Profile contract | `profile-complete.ts`, `profile-repository.ts`, `profile-status/route.ts` |
| Auth handoff | `auth-screen.tsx` |
| Onboarding | `onboarding-flow.tsx`, `onboarding-numerology-preview.tsx` |
| Profile UI | `profile-personal-details-section.tsx` |
| i18n | `en.json`, `ru.json` |
| Tests | `phase-18b-dob-profile-onboarding-gate.test.ts` |

## Final profile contract

```text
users/{uid}.displayName     — real name (not shell placeholder)
users/{uid}.language        — "en" | "ru"
user_private/{uid}.dob      — Timestamp, normalized as YYYY-MM-DD in app code

profileComplete = deriveProfileComplete({ displayName, dateOfBirth, language })
```

Shell names (`Mystic member`, `Vedunya Maria member`) do **not** count as complete.

Legacy `users.dob` is read for compatibility; writes use `user_private.dob` only.

## Auth / register redirect behavior

| Event | Destination |
|-------|-------------|
| Register success | Always `/{locale}/onboarding` |
| Login success, incomplete profile | `/{locale}/onboarding` |
| Login success, complete profile | `/{locale}/today` |
| Social login | Same as login (profile-derived) |

Redirects wait for `sessionReady` and use a one-shot ref to avoid loops.

## DOB screen behavior

Steps: Name → DOB → Language → Numerology preview → Continue to Today.

- Native `type="date"` input (`DobInput`) with `min=1900-01-01`, `max=today`
- Empty default for new users (no pre-filled date)
- Validation: required, valid YYYY-MM-DD, not future, year ≥ 1900

## Numerology preview behavior

Uses Phase 17 `buildPersonalDayResult` (Sujok personal day) with Mystic RU/EN content.

Headline: “Your rhythm today is {number}” / “Ваш ритм сегодня — {number}”.

## Today route protection

Server-side redirects (no client `router.replace` on Today):

- Signed-in incomplete → `/{locale}/onboarding`
- Signed-in complete at `/{locale}` → `/{locale}/today`
- Signed-in complete at `/{locale}/onboarding` → `/{locale}/today`

`loadDailyGuidance` still guards missing DOB with setup CTA as fallback.

## Profile DOB behavior

Personal details shows formatted DOB when present. When missing, shows CTA copy and link to `/onboarding`.

## Tests added

`src/features/onboarding/tests/phase-18b-dob-profile-onboarding-gate.test.ts` — 15+ cases covering contract, handoff, route protection, DOB validation, preview, profile CTA, and RU/EN copy.

## Known gaps

- Profile inline DOB edit remains basic (`type="date"`); full edit parity with onboarding is out of scope.
- OAuth redirect return routing still flows through auth screen profile check (not forced onboarding for brand-new social accounts — profile-derived incomplete handles this).
