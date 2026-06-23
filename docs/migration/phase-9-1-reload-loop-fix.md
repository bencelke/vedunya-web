# Phase 9.1 — Reload loop fix

## Observed symptom

During local development, the terminal repeatedly logged:

```text
GET /ru 200
GET /ru 200
GET /ru 200
```

The browser appeared to reload `/ru` continuously without user interaction.

## Suspected root cause

Phase 8/9 PWA work added service worker registration and update handling. The likely loop was:

1. `PwaRegistrar` registered `public/sw.js` in development.
2. Service worker `activate` called `clients.claim()`.
3. `controllerchange` fired in the browser.
4. `PwaRegistrar` unconditionally called `window.location.reload()`.
5. Page reloaded, service worker updated again, and the cycle repeated.

## Files inspected

- `public/sw.js`
- `src/components/pwa/pwa-registrar.tsx`
- `src/features/pwa/**`
- `src/features/notifications/**`
- `src/app/[locale]/layout.tsx`
- `src/app/[locale]/page.tsx`
- `src/proxy.ts`
- `src/i18n/routing.ts`

No locale redirect loop was found on `/ru`. Notification hooks do not call `router.refresh()` or poll on an interval.

## Actual root cause

`src/components/pwa/pwa-registrar.tsx` attached a `controllerchange` listener that always executed `window.location.reload()`. In development, service worker install/activate/claim cycles are frequent, so this produced a full-page reload loop on `/ru`.

## Fix implemented

1. **Development:** unregister existing service workers and skip new registration when `NODE_ENV !== "production"`.
2. **Production:** keep service worker registration and update banner.
3. **Reload guard:** reload only after the user clicks **Update**, using a one-time `sessionStorage` flag consumed on `controllerchange`.
4. **Service worker:** left `skipWaiting()` message-driven only; no automatic `skipWaiting()` on install.

## Why this is safe

- Production PWA install, offline shell, and Web Push behavior remain enabled.
- Development no longer fights Next.js hot reload with a controlling service worker.
- Users are not force-reloaded unless they explicitly accept an app update.
- `/api/*` remains excluded from service worker caching.

## Dev vs production service worker behavior

| Environment | Service worker |
| --- | --- |
| Development | Unregister on load; do not register |
| Production | Register `/sw.js`; show update banner; reload only after explicit update click |

## Manual browser cleanup instructions

If a stale service worker is still attached locally:

1. Open DevTools → **Application** → **Service Workers** → **Unregister**
2. DevTools → **Application** → **Storage** → **Clear site data**
3. Hard refresh the page

Then restart `npm run dev` and open `http://localhost:3000/ru` again.

## Tests added

- `src/features/pwa/tests/reload-loop-fix.test.ts`
- Updated `src/features/pwa/tests/pwa-foundation.test.ts`

## Remaining notes

- Offline page manual reload button is unchanged and only runs on user click.
- Real PWA/Web Push testing still requires production build or deployed HTTPS environment.
