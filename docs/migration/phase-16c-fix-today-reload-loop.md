# Phase 16C — Fix Today reload loop

Date: 2026-06-24  
Project: `/Users/boris/Documents/vedunya-web`

## Root cause

**Category:** RSC refetch loop on `/today` (logged as repeated `GET /ru/today 200`).

**Exact file:** `src/features/numerology/components/timezone-cookie-sync.tsx`

`/today` is `force-dynamic` and reads `vedunya_tz` via `cookies()` in `load-daily-guidance.ts`. `TimezoneCookieSync` runs in a `useEffect` on every Today client remount.

The guard compared the browser’s **decoded** cookie value to an **encoded** timezone string:

```text
existing from document.cookie: Europe/Moscow
encoded new value:              Europe%2FMoscow
```

The comparison always failed for IANA zones containing `/`, so `document.cookie` was rewritten on every remount. That invalidated the dynamic RSC payload, Next.js refetched `/today`, the component remounted, and the loop repeated.

## Root cause (update)

The timezone cookie fix was necessary but **not sufficient** for signed-in users.

**Primary remaining trigger:** `AuthProvider` called `createServerSession()` on every mount. Each successful `POST /api/auth/session` returned a new `Set-Cookie`, which invalidated the dynamic `/today` RSC payload and caused another refetch. Module-level dedupe did not survive full refetches/reloads, so the POST → Set-Cookie → `GET /ru/today` cycle repeated.

A secondary bug made this worse: `POST /api/auth/session` rejected valid Firebase ID tokens for users signed in longer than 5 minutes because it compared `auth_time` (original sign-in) instead of token freshness.

## Fix (update)

1. **`syncServerSession()`** — call `GET /api/auth/me` first; skip `POST /api/auth/session` when the HttpOnly session already matches the Firebase UID.
2. **`auth-provider.tsx`** — use `syncServerSession(token, uid)` instead of `createServerSession(token)`.
3. **`/api/auth/session`** — remove incorrect `auth_time` age gate; `verifyIdToken` already validates the token.

Timezone cookie decoded comparison fix from `21bb6d9` remains in place.

## Secondary hardening (preserved)

Signed-out auth/session churn was also reduced:

- `src/features/auth/components/auth-provider.tsx` — skip initial `clearServerSession()` when Firebase resolves signed-out
- `src/features/auth/services/session-service.ts` — dedupe session sync and logout POSTs per tab

These are complementary; the Today idle loop was caused by the timezone cookie guard.

## Files modified

| File | Change |
|------|--------|
| `src/features/numerology/utils/timezone-cookie.ts` | Decoded cookie comparison helpers |
| `src/features/numerology/components/timezone-cookie-sync.tsx` | Use helpers; stop encoded-vs-decoded compare |
| `src/features/auth/components/auth-provider.tsx` | Skip initial signed-out logout ping |
| `src/features/auth/services/session-service.ts` | Session/logout dedupe |
| `src/features/auth/components/auth-screen.tsx` | Pathname redirect guard |
| `src/features/auth/components/signed-out-root-redirect.tsx` | Pathname guard |
| `src/features/onboarding/components/intro-onboarding-gate.tsx` | Pathname guard |
| `src/components/pwa/dev-service-worker-cleanup-script.tsx` | One-shot dev SW cleanup guard |
| `src/features/numerology/tests/timezone-cookie-sync.test.ts` | Timezone cookie unit tests |
| `src/features/auth/tests/session-service.test.ts` | Session dedupe tests |
| `src/features/auth/tests/phase-16c-today-reload-loop.test.ts` | Reload-loop regression guards |
| `src/features/pwa/tests/hard-stop-dev-reload-loop.test.ts` | Dev SW cleanup assertion |

## Tests added

- `src/features/numerology/tests/timezone-cookie-sync.test.ts`
  - decoded `Europe/Moscow` → no rewrite
  - encoded `Europe%2FMoscow` → no rewrite
  - missing cookie → write once (encoded)
  - different timezone → write once (encoded)
- `src/features/auth/tests/session-service.test.ts`
- Updated `src/features/auth/tests/phase-16c-today-reload-loop.test.ts`

## Manual idle test

After `npm run dev`, open each route and leave idle ~90 seconds. Terminal should not spam `GET /ru/today`.

| Route | Expected |
|-------|----------|
| `/ru/today` | No repeated idle loop |
| `/en/today` | Stable |
| `/ru` | Stable |
| `/ru/login` | Stable |
| `/ru/onboarding` | Stable |

## Validation

Run:

```bash
npm run lint
npm test
npm run build
```

## Safe to deploy

Yes, after manual idle confirmation on `/ru/today`. Change is limited to timezone cookie comparison and existing auth/session hardening. Production PWA behavior unchanged.
