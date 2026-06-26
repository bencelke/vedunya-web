# Phase 20C — Today dev reload loop hard fix

## Observed logs

```text
GET /ru/today 200
GET /manifest.webmanifest 200
ChunkLoadError: Failed to load chunk /_next/static/chunks/[turbopack]_browser_dev_hmr-client...
GET /ru/today 200
GET /manifest.webmanifest 200
GET /ru/today 200
```

Also seen when multiple dev servers were running:

```text
Port 3000 is in use by process 49120, using available port 3001 instead.
```

`GET /manifest.webmanifest` alongside repeated `GET /ru/today` indicates **full document reloads**, not `router.refresh()` alone.

## Environment findings

| Check | Result |
|-------|--------|
| Port 3000 occupied | Was free after killing stale `next dev` processes |
| Multiple dev servers | Likely contributor when port fell back to 3001 (stale HMR client on 3000) |
| `.next` reset | Recommended; clears stale Turbopack chunks |
| Timezone cookie loop | **Not involved** — `shouldWriteTimezoneCookie` still decodes `Europe%2FMoscow` correctly |
| Auth/session loop | **Not involved** — dedupe guards intact; no `router.refresh` in auth provider |
| Today UI mount loop | **Not involved** — `/today` page has no client effects or router calls |

## Root cause

**Primary code trigger:** `DevServiceWorkerCleanupScript` called `window.location.reload()` after unregistering stale service workers in development. Combined with stale Turbopack HMR chunks or multiple dev servers, this produced repeated full-page reloads (each reload fetches `/ru/today` + `manifest.webmanifest`). `ChunkLoadError` on the Turbopack HMR client is a secondary symptom of stale/multi-server dev state.

**Contributing factor:** Running more than one `next dev` instance (port 3000 vs 3001) leaves browsers pointed at the wrong HMR endpoint.

## Fix applied

1. **`dev-service-worker-cleanup-script.tsx`** — unregister Mystic service workers and clear `mystic-*` caches in dev **without** `location.reload()`.
2. **`pwa-registrar.tsx`** — hard gate: `process.env.NODE_ENV === "development"` returns `null` (no registration, no `controllerchange` listener).
3. Removed unused `DEV_SW_RELOAD_KEY` from `service-worker-lifecycle.ts`.

PWA production behavior unchanged: explicit user update still reloads via `consumePendingServiceWorkerUpdateReload()`.

## Files changed

- `src/components/pwa/dev-service-worker-cleanup-script.tsx`
- `src/components/pwa/pwa-registrar.tsx`
- `src/features/pwa/utils/service-worker-lifecycle.ts`
- `src/features/today/tests/phase-20c-today-dev-reload-loop-fix.test.ts` (new)
- `src/features/today/tests/phase-19a1-today-reload-loop-fix.test.ts` (updated)
- `src/features/today/tests/phase-19c1-today-reload-loop-hardening.test.ts` (updated)
- `src/features/pwa/tests/hard-stop-dev-reload-loop.test.ts` (updated)

## Tests added/updated

Phase 20C covers:

1. PWA registrar does not register/reload in development
2. Dev SW cleanup unregisters without `location.reload`
3. Timezone cookie no-op when unchanged
4. Auth session dedupe intact
5. Today page has no idle `router.refresh` / redirect loop

## Manual QA

After `pkill -f "next dev"`, `rm -rf .next`, `npm run dev` on port 3000:

- `/ru/today` — initial load OK; no repeated GET spam during idle observation
- `/en/today` — same
- `/ru`, `/en`, `/ru/plus`, `/en/plus`, `/ru/login`, `/en/login` — load without reload loop

## Known gaps

- Stale service workers from prior production PWA visits may require one manual hard refresh or DevTools → Application → Unregister after this fix (no auto-reload by design).
- Always run a single `next dev` on port 3000 before idle testing.
- Phase 19E/20 Today and paywall UI preserved.
