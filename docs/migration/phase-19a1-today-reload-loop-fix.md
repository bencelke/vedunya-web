# Phase 19A.1 — Today reload loop fix

## Observed loop

After Phase 19A Today UX cleanup, local dev repeatedly logged:

```text
GET /ru/today 200
GET /manifest.webmanifest 200
GET /ru/today 200
GET /manifest.webmanifest 200
```

`manifest.webmanifest` on every cycle indicates **full document reloads**, not only soft RSC refetches.

`ChunkLoadError` was also reported — often stale Turbopack chunks after code changes; `rm -rf .next` addresses that part.

## Exact trigger found

**Category B — timezone cookie write loop** (primary)

`/today` is `force-dynamic` and reads `vedunya_tz` via `cookies()` in `load-daily-guidance.ts`. `TimezoneCookieSync` runs on mount.

`getCookieValue()` split only on `"; "`. When other cookies (e.g. `NEXT_LOCALE`) appear before `vedunya_tz` with a plain `";"` separator, the timezone cookie was **not detected**. `shouldWriteTimezoneCookie()` returned true on every remount → `document.cookie` rewrite → dynamic RSC invalidation → another `GET /ru/today` → remount → loop.

**Category E — stale dev service worker + ChunkLoadError** (secondary)

A stale production service worker controlling localhost can serve bad `/_next/static/chunks/*` assets → `ChunkLoadError` → full reload → manifest fetch → repeat until SW is cleared.

Phase 19A UX components (brand header, request card) do **not** call `router.refresh`, write cookies, or reload on mount.

## Files changed

| File | Change |
|------|--------|
| `src/features/numerology/utils/timezone-cookie.ts` | Parse cookies with `;` + trim (not only `"; "`) |
| `src/features/numerology/components/timezone-cookie-sync.tsx` | `useRef` + `sessionStorage` guard against repeat writes |
| `src/features/numerology/engine/date-only.ts` | Decode encoded timezone cookie values server-side |
| `src/components/pwa/dev-service-worker-cleanup-script.tsx` | One-time guarded reload after unregistering stale SW |
| `src/features/pwa/utils/service-worker-lifecycle.ts` | `DEV_SW_RELOAD_KEY` constant |
| `src/features/numerology/tests/timezone-cookie-sync.test.ts` | Multi-cookie parsing cases |
| `src/features/today/tests/phase-19a1-today-reload-loop-fix.test.ts` | **New** regression tests |
| `src/features/auth/tests/phase-16c-today-reload-loop.test.ts` | Updated timezone guard expectations |
| `src/features/pwa/tests/hard-stop-dev-reload-loop.test.ts` | Assert one-time dev SW reload guard |

## Fix applied

1. **Robust cookie parsing** — find `vedunya_tz` regardless of `;` vs `; ` separators.
2. **Timezone sync guards** — `useRef` + `sessionStorage` so the client writes at most once per timezone per tab.
3. **Server decode** — `resolveTimeZone()` decodes `Europe%2FBerlin` before IANA validation.
4. **Dev SW hardening** — after unregistering stale workers, reload **once** (guarded by `mystic:dev-sw-reload-done`) to clear bad chunk cache; production PWA unchanged.

## Tests added

- `phase-19a1-today-reload-loop-fix.test.ts` — cookie parsing, server decode, no mount refresh on Today/brand/request, session dedupe, PWA dev inert, SW one-time reload guard.
- Extended `timezone-cookie-sync.test.ts` with multi-cookie header cases.

## Manual idle QA

After `rm -rf .next && npm run dev`:

| Route | Result |
|-------|--------|
| `/ru/today` idle ~35s (curl + server log) | No spontaneous GET spam after initial load |
| `/en/today` | Same pattern expected |

Full 90s browser idle should be re-checked locally with DevTools Network open. If a stale SW remains, clear site data once.

## Known gaps

- Browser 90s idle not automated in CI.
- First dev visit after a stale SW may perform **one** guarded reload (intentional).
- `ChunkLoadError` after large refactors still requires `rm -rf .next` if Turbopack cache is corrupt.

## Safety

- No commit / push / deploy
- `.env.local` untouched
- Flutter untouched
- No secrets printed
