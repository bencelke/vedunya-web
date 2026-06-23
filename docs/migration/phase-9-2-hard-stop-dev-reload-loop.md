# Phase 9.2 — Hard stop local reload/update loop

## Symptom

During `npm run dev`, the terminal repeatedly logged:

```text
GET /ru 200
GET /ru 200
GET /ru 200
```

The browser appeared to reload `/ru` continuously without user interaction.

## Files inspected

- `public/sw.js`
- `src/components/pwa/pwa-registrar.tsx`
- `src/components/pwa/dev-service-worker-cleanup.tsx`
- `src/config/pwa.ts`
- `src/features/pwa/**`
- `src/features/notifications/**`
- `src/app/[locale]/layout.tsx`
- `src/app/[locale]/page.tsx`
- `src/proxy.ts`
- `src/i18n/routing.ts`
- `src/features/auth/components/auth-provider.tsx`
- `src/features/profile/components/profile-content.tsx`

## Reload/navigation sources found

| Source | Risk |
| --- | --- |
| `pwa-registrar.tsx` `controllerchange` → `window.location.reload()` | High — loop if SW keeps claiming control |
| `public/sw.js` `clients.claim()` on every `activate` | High — fires `controllerchange` without user action |
| Stale localhost service worker from earlier dev sessions | High — continues controlling origin after code changes |
| `offline-actions.tsx` manual reload button | Low — user click only |
| `auth-screen.tsx` / profile `router.replace` + `router.refresh` | None on `/ru` landing |
| Notification hooks | None — no `useEffect`, no router navigation |

No locale redirect loop was found for `/ru`.

## Root cause

Two compounding issues:

1. **Phase 9.1** still allowed development pages to interact with service worker lifecycle while a stale worker controlled localhost.
2. **`public/sw.js`** called `clients.claim()` on every activation, which can trigger `controllerchange` even when the app did not request an update.

Together with earlier unconditional reload behavior, this produced repeated full document reloads (`GET /ru 200`).

## Fixes implemented

1. **Central runtime flag** in `src/config/pwa.ts`:
   - `isPwaEnabled` is `true` only in production when `NEXT_PUBLIC_ENABLE_PWA !== "false"`.
2. **`PwaRegistrar` is fully inert in development** — returns `null` before any production-only hooks run.
3. **`DevServiceWorkerCleanup`** runs once per tab in development:
   - unregisters all localhost service workers
   - clears Mystic `mystic-*` caches only
   - does not touch cookies, session, or IndexedDB
4. **Production registrar split** (`PwaRegistrarProduction`) keeps update banner + one-time guarded reload after explicit user action.
5. **Service worker** no longer calls `clients.claim()` on activate; it claims only after explicit `SKIP_WAITING`.
6. **Push runtime disabled in development** — UI shows honest dev copy; no SW subscription attempts.
7. **`beforeInteractive` cleanup script** unregisters stale workers before React hydrates.
8. **Development rewrite** serves `/sw-dev-noop.js` instead of `/sw.js` during `next dev`.

## Dev vs production behavior

| Environment | Service worker | Push reminders |
| --- | --- | --- |
| Development | Unregistered + not registered; cleanup once per tab | UI visible; enable blocked with dev message |
| Production | Registered; update banner; reload only after Update click | Full Web Push flow |

## Manual browser cleanup

If a stale worker still controls localhost:

1. Stop dev server.
2. DevTools → **Application** → **Service Workers** → **Unregister**
3. DevTools → **Application** → **Storage** → **Clear site data**
4. Close tab.
5. `rm -rf .next`
6. `npm run dev`
7. Open `/ru` and leave idle for 60 seconds.

## Tests added/updated

- `src/features/pwa/tests/hard-stop-dev-reload-loop.test.ts`
- Updated `src/features/pwa/tests/reload-loop-fix.test.ts`
- Updated `src/features/pwa/tests/pwa-foundation.test.ts`

## Safe to continue Phase 10?

Yes, after confirming `/ru` stays idle for 60 seconds in a fresh dev session with cleanup applied.
