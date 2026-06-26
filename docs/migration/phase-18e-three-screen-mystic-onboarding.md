# Phase 18E — Three-screen Mystic onboarding

## Files inspected

- `src/features/onboarding/components/intro-onboarding-flow.tsx`
- `src/features/onboarding/components/intro-rhythm-screen.tsx`
- `src/features/onboarding/components/intro-brand-header.tsx`
- `src/features/onboarding/components/intro-practice-features.tsx`
- `src/features/onboarding/components/onboarding-flow.tsx`
- `src/features/onboarding/components/dob-input.tsx`
- `src/features/onboarding/utils/resolve-profile-completion.ts`
- `src/features/onboarding/services/preauth-onboarding-draft.ts`
- `src/features/auth/components/auth-screen.tsx`
- `src/features/auth/components/auth-brand-header.tsx`
- `src/app/api/auth/profile-status/route.ts`
- `src/app/[locale]/onboarding/page.tsx`
- `src/app/[locale]/login/page.tsx`
- Flutter reference: `lib/features/onboarding/onboarding_flow.dart` (read-only)

## Files changed

### New

- `src/features/onboarding/components/intro-brand-header.tsx`
- `src/features/onboarding/components/intro-practice-features.tsx`
- `src/features/onboarding/components/intro-rhythm-screen.tsx`
- `src/features/onboarding/utils/resolve-profile-completion.ts`
- `src/features/onboarding/tests/phase-18e-three-screen-mystic-onboarding.test.ts`
- `docs/migration/phase-18e-three-screen-mystic-onboarding.md`

### Modified

- `src/features/onboarding/components/intro-onboarding-flow.tsx` — 3-screen flow
- `src/features/onboarding/components/onboarding-flow.tsx` — compact post-auth completion
- `src/features/onboarding/components/dob-input.tsx` — premium picker variant
- `src/features/onboarding/services/preauth-onboarding-draft.ts` — `introCompleted` flag
- `src/messages/en.json`, `src/messages/ru.json` — brand + screen copy
- `src/styles/mystic-theme.css` — brand wordmark + DOB picker styles
- Onboarding/auth/brand test suites (18A–18G, parity, phase-9/12/17)

## Final signed-out flow

```text
Screen 1 — Daily guidance hero (moon / rune / personal number chips)
Screen 2 — Practice ecosystem (Universe request + reminders + courses)
Screen 3 — Birth date + live numerology preview + Create account / Log in
→ Auth screen (MYSTIC by Vedunya Maria)
→ Post-auth compact completion (only if name/language/DOB still missing)
→ Today
```

Removed from active flow: 4-page carousel, separate first glimpse, separate DOB step, separate preview step (previously 7 steps).

## Temp DOB storage

- Key: `vedunya_preauth_onboarding_draft` in **sessionStorage**
- Fields: `dateOfBirth`, `locale`, `introCompleted`, `createdAt`
- Written on valid DOB selection (`IntroRhythmScreen`) and before auth navigation
- Read on post-auth `OnboardingFlow` mount via `resolveProfileCompletionState`
- Cleared after successful `completeUserProfile()` via `clearPreAuthOnboardingDraft()`

## Auth handoff

1. User completes screen 3 with valid DOB → draft saved to sessionStorage
2. **Create account** → `/login?mode=register`; **Log in** → `/login`
3. After auth → `fetchProfileStatus()` routes to `/onboarding` if profile incomplete
4. Compact completion auto-saves when name + DOB + language all resolve (pre-auth DOB + Firebase displayName + route locale)
5. Otherwise single compact screen asks only for missing name and/or language and/or DOB

## Post-auth completion

- **No** 4-step Name → DOB → Language → Preview chain
- Single compact screen (`auth.onboarding.compact`) with conditional fields
- `resolveProfileCompletionState()` centralizes missing-field detection and auto-complete eligibility
- Profile DOB is never overwritten when already present in `user_private`
- Numerology preview shown pre-auth on screen 3 only

## Brand unification

- `auth.brandWordmark` → **MYSTIC by Vedunya Maria** (EN/RU) on intro shell, auth shell, and profile completion
- `dailyGuidance.brandWordmark` remains **Vedunya Maria** (in-app Today context)
- Intro uses `IntroBrandHeader` with Makosh emblem + unified wordmark

## Tests added/updated

- **New:** `phase-18e-three-screen-mystic-onboarding.test.ts`
- **Updated:** 18A, 18B1, 18C, 18F, 18F1, 18G, onboarding-parity, auth-ui-parity, phase-9-4, phase-12a, phase-17

### Validation results

| Check | Result |
|-------|--------|
| `npm run lint` | Pass (1 pre-existing PWA warning) |
| `npm test` | **765/765 pass** |
| `npm run build` | Pass |

## Manual QA

Automated smoke (dev server on `:3000`):

- `GET /en/onboarding` → 200, HTML contains `MYSTIC by Vedunya Maria`
- `GET /en/login` → 200

Full incognito browser walkthrough (3 screens → DOB preview → auth → Today) **not run in this session**. Recommended before merge.

## Known gaps

- Mobile DOB uses bottom-sheet + native `<select>` columns (iOS-friendly); not a custom infinite scroll wheel
- Legacy intro translation keys (`pages`, `glimpse`) remain in messages but are unused in active flow
- `intro-preauth-dob.tsx`, `intro-first-glimpse.tsx`, `intro-preauth-numerology-preview.tsx` remain in repo but are unwired
- Full end-to-end auth + DOB persistence requires manual browser QA with Firebase credentials
