# Phase 18F — Mystic onboarding experience flow

## Flutter files inspected (read-only)

- `lib/features/onboarding/onboarding_flow.dart`
- `lib/screens/auth_gate.dart`
- `lib/screens/welcome_auth_screen.dart`
- `lib/screens/login_screen.dart`
- `lib/services/daily_guidance/daily_guidance_loader.dart`
- `lib/services/daily_guidance/personal_day_numerology_service.dart`
- `lib/data/daily_guidance/personal_day_guidance_dataset.dart`

Flutter was **not modified**.

## Final signed-out flow

```text
/ru or /en (signed out)
→ intro carousel (4 pages)
→ first glimpse (deterministic, non-personalized)
→ Create account / Log in
```

No DOB before account creation.

## First glimpse behavior

- Deterministic daily note from `first-glimpse-content.ts` (date-based pool, no DOB)
- Explicit disclaimer: general note, not personal numerology
- Create account → `/login?mode=register`
- Log in → `/login`
- Marks intro seen, same as before

## Final signed-in profile onboarding flow

```text
register/login (incomplete profile)
→ /{locale}/onboarding (OnboardingRoute client gate)
→ Name → DOB → Language → Numerology preview → Today
```

Fixed in Phase 18B1: server-only session check showed intro instead of profile onboarding after login.

## DOB gate behavior

`profileComplete` derived from:

- `displayName` (not shell placeholder)
- `language` ∈ {en, ru}
- `user_private/{uid}.dob`

Legacy `users.profileComplete: true` without DOB → incomplete → onboarding.

`/today` server-redirects incomplete users to `/onboarding`.

## Login/register routing

| Event | Destination |
|-------|-------------|
| Register | Always `/onboarding` |
| Login, complete | `/today` |
| Login, missing DOB/name/language | `/onboarding` |

Waits for `sessionReady`; no redirect loops.

## test@test.com note

Cannot verify live Firestore data in CI. Code treats any user without `user_private.dob` as incomplete regardless of legacy `profileComplete` flag.

## Files changed

- `intro-onboarding-flow.tsx` — 5th step: first glimpse
- `intro-first-glimpse.tsx` (new)
- `first-glimpse-content.ts` (new)
- `en.json`, `ru.json` — glimpse copy
- `phase-18f-mystic-onboarding-experience-flow.test.ts` (new)
- Updated `phase-18a-intro-onboarding-polish.test.ts`

## Known gaps

- First glimpse uses client date pool, not live moon/rune Firestore (would need API route)
- Full incognito E2E requires manual test account
