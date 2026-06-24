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

## Fix

1. **`src/features/numerology/utils/timezone-cookie.ts`** — pure helpers:
   - `safeDecodeCookieValue`
   - `getCookieValue`
   - `shouldWriteTimezoneCookie` (decoded existing value vs raw timezone)
   - `formatTimezoneCookieAssignment`
2. **`src/features/numerology/components/timezone-cookie-sync.tsx`** — only writes when `shouldWriteTimezoneCookie` is true.

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
