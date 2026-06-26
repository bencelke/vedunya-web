# Phase 19C.1 — Today reload-loop hardening

## Observed loop

After Phase 19C premium Today / language work, local dev again showed:

```text
GET /ru/today 200
GET /manifest.webmanifest 200
ChunkLoadError: Failed to load chunk /_next/static/chunks/[turbopack]_browser_dev_hmr-client...
GET /ru/today 200
```

`manifest.webmanifest` on each cycle indicates **full document reloads**, not soft RSC polling alone.

## `.next` reset

`rm -rf .next` clears stale Turbopack/HMR chunks and often stops `ChunkLoadError` loops by itself. This phase still reapplied code hardening so non-cache triggers cannot reintroduce the loop after visual changes.

## Exact trigger found

**Same class as Phase 19A.1** — compounded by:

1. **Timezone cookie write risk** — cookie comparison must run before any write; empty/whitespace cookie values must be treated as missing.
2. **Auth provider locale re-subscription** — `locale` in `AuthProvider` effect deps re-subscribed Firebase on locale context updates, causing unnecessary session sync churn (not a full reload by itself, but adds noise next to cookie/SW triggers).
3. **Dev SW cleanup reload race** — one-time reload after unregister could re-enter cleanup logic before `DEV_SW_CLEANUP_KEY` was set.

Phase 19C UI (`LanguageDropdown`, rhythm cards, background) does **not** call `router.refresh`, write cookies, or reload on mount.

## Files changed

| File | Change |
|------|--------|
| `src/features/numerology/utils/timezone-cookie.ts` | Trim values; treat empty cookie as missing |
| `src/features/numerology/components/timezone-cookie-sync.tsx` | Cookie comparison before sessionStorage; mark ref on no-op |
| `src/features/auth/components/auth-provider.tsx` | `localeRef` — remove `locale` from effect deps |
| `src/components/pwa/dev-service-worker-cleanup-script.tsx` | Set cleanup key before one-time reload |
| `src/features/numerology/tests/timezone-cookie-sync.test.ts` | Empty cookie case |
| `src/features/today/tests/phase-19c1-today-reload-loop-hardening.test.ts` | **New** regression tests |
| `src/features/today/tests/phase-19a1-today-reload-loop-fix.test.ts` | Dev SW cleanup ordering |

## Fix applied

1. **Timezone** — compare decoded cookie first; skip write when unchanged; guard empty values.
2. **Auth** — bootstrap locale via ref; Firebase `onIdTokenChanged` subscription no longer restarts on locale change.
3. **PWA dev** — mark cleanup complete before the single post-unregister reload.

## Tests added

`phase-19c1-today-reload-loop-hardening.test.ts` — timezone order, auth locale ref, session dedupe, PWA dev guards, Today mount safety, Phase 19C UI preserved.

## Manual idle QA

After `rm -rf .next && npm run dev`:

| Route | Result |
|-------|--------|
| `/ru/today` | Initial GET 200; **no additional GET spam during 90s idle** (server log) |
| `/en/today` | Initial GET 200; idle stable |

Verified via dev server log: only the two warmup requests appeared; no repeated `manifest.webmanifest` or `ChunkLoadError` after clean `.next`.

Full signed-in browser idle with DevTools Network should still be re-checked locally.

## Known gaps

- Browser 90s idle not automated in CI.
- `ChunkLoadError` after large refactors may still need `rm -rf .next`.
- First dev visit after stale SW may perform **one** guarded reload (intentional).

## Safety

- No commit / push / deploy
- `.env.local` untouched
- Flutter untouched
- Phase 19C visual work preserved
- No secrets printed
