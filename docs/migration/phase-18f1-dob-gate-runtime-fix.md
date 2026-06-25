# Phase 18F1 — DOB gate runtime fix

## Why DOB was skipped

Two compounding issues:

1. **Post-login redirect race** in `auth-screen.tsx`: when Firebase restored the user and `sessionReady` became true, a `useEffect` called `redirectAfterAuth()` **before** `handleAuthSuccess()` set `pendingRedirectRef`. That could route to Today based on a premature or stale profile-status read during the login handoff.

2. **Legacy DOB fallback** in `profile-repository.ts`: `getProfileSnapshot()` read DOB from `users/{uid}.dob` when `user_private/{uid}.dob` was missing. Flutter Mystic stores DOB on the public `users` doc with `profileComplete: true` without always mirroring to `user_private`. That could mark the web profile complete without the canonical private DOB the web onboarding flow expects.

## Exact file/function causing the bug

| File | Function / area |
|------|-----------------|
| `src/features/auth/components/auth-screen.tsx` | `useEffect` unconditional `void redirectAfterAuth()` on `user && sessionReady` |
| `src/features/profile/services/profile-repository.ts` | `timestampToDate(publicData.dob)` fallback |

## profile-status behavior

### Before

```json
{ "authenticated": true, "profileComplete": true }
```

Could be `true` when `users.dob` existed but `user_private.dob` did not.

### After

```json
{
  "authenticated": true,
  "profileComplete": false,
  "missing": ["dob"]
}
```

Derived via `resolveProfileStatus()` from `displayName`, `language`, and **canonical** `user_private.dob` only.

## Login/register routing

| Event | Destination |
|-------|-------------|
| Register | Always `/onboarding` |
| Login, `profileComplete: true` | `/today` |
| Login, incomplete | `/onboarding` |

Waits for `fetchProfileStatus()` before redirect. No redirect while auth is loading. Existing-session visits to `/login` still auto-redirect via `hadUserOnMountRef`.

## Today route protection

Server-side `today/page.tsx` redirects incomplete profiles to `/onboarding` via `isProfileComplete()`.

## Tests added

`src/features/onboarding/tests/phase-18f1-dob-gate-runtime-fix.test.ts` — 11 cases covering profile-status contract, routing, DOB source, onboarding steps, loop safety.

## Manual QA

Not run against live `test@test.com` in this session. Recommended:

1. Login `test@test.com` without `user_private.dob` → `/en/onboarding` → Name → DOB → Language → Preview → Today
2. Direct `/en/today` while missing DOB → redirect to onboarding
3. `/en/onboarding` while signed-in incomplete → profile onboarding, not intro
4. Idle 60s on onboarding / 90s on today — no loops

## Known gaps

- Legacy Flutter users with DOB only on `users.dob` must re-enter DOB once on web (writes `user_private.dob`)
- Live Firestore state for `test@test.com` not verified in CI
