# Phase 18B1 — DOB onboarding visibility fix

## Why Boris did not see DOB

Boris was almost certainly seeing **signed-out intro onboarding** (Mode A), not **signed-in profile onboarding** (Mode B).

The `/onboarding` page decided signed-in vs signed-out using **only the server session cookie** (`getCurrentUser()`). After register/login on the client:

1. Firebase auth succeeded on the client
2. User was redirected to `/onboarding`
3. The server render could still see **no session cookie** (RSC cache, timing, or soft navigation)
4. Page rendered `IntroOnboardingGate` → intro carousel (guidance / universe / reminders / courses)
5. **No Name / DOB / Language / Preview steps** — intro flow ends at login/register

So tests passed (they inspect source files and derived `profileComplete` logic) but the **runtime route switch** showed the wrong onboarding mode.

## Two onboarding modes

| Mode | When | Component | DOB? |
|------|------|-----------|------|
| A — Intro | Signed out on `/onboarding` | `IntroOnboardingFlow` | No |
| B — Profile | Signed in, incomplete profile | `OnboardingFlow` | Yes (step 2) |

## Root cause

**Server-only auth gate on `/onboarding`** — client Firebase session existed after login, but server RSC treated user as signed out → intro onboarding.

Secondary issue: **session draft could skip DOB** if `step` in sessionStorage was advanced without a valid DOB.

## Fix

1. **`OnboardingRoute` client component** — if Firebase `user` OR server session exists → `OnboardingFlow`; else → `IntroOnboardingGate`
2. **`resolveOnboardingStep()`** — caps draft step so DOB cannot be skipped
3. **Auth handoff** — wait for `sessionReady` before post-login redirect; register always forces `/onboarding`
4. **Login/register forms** — do not call `onSuccess` if `createServerSession` fails

## profileComplete contract (unchanged)

```text
displayName (not shell placeholder)
language ∈ {en, ru}
user_private/{uid}.dob exists and is valid YYYY-MM-DD
```

Stale `users.profileComplete: true` without DOB → incomplete.

## Files changed

- `src/features/onboarding/components/onboarding-route.tsx` (new)
- `src/app/[locale]/onboarding/page.tsx`
- `src/features/onboarding/utils/resolve-onboarding-step.ts` (new)
- `src/features/onboarding/components/onboarding-flow.tsx`
- `src/features/auth/components/auth-screen.tsx`
- `src/features/auth/components/login-form.tsx`
- `src/features/auth/components/register-form.tsx`
- `src/features/onboarding/tests/phase-18b1-dob-onboarding-visibility-fix.test.ts`

## Firestore DOB read/write

Server reads `user_private/{uid}.dob` via Admin SDK in `getProfileSnapshot`. Client writes DOB on onboarding complete via `completeUserProfile`. Rules review doc confirms owner read/write on `user_private/{uid}` — no rule changes in this phase.

## Manual QA

After fix, post-login `/ru/onboarding` should show profile panel (wordmark + logo) with Name step, then DOB Day/Month/Year fields.
