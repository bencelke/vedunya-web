# Phase 20C.1 — Disable Turbopack dev mode

## Observed issue

Repeated dev-only errors while idle on `/ru/today`:

```text
ChunkLoadError: Failed to load chunk /_next/static/chunks/[turbopack]_browser_dev_hmr-client...
ChunkLoadError: Failed to load chunk node_modules_next_dist_client_components_builtin_global-error...
GET /ru/today 200
GET /manifest.webmanifest 200
GET /ru/today 200
```

Dev server banner:

```text
Next.js 16.2.9 (Turbopack)
```

After many rapid UI edits, Turbopack HMR in this repo became unstable (stale chunk client / wrong port when multiple dev servers ran). This is **dev tooling churn**, not product route logic.

## Fix

`package.json` scripts:

| Script | Before | After |
|--------|--------|-------|
| `dev` | `next dev` | `next dev --webpack` |
| `dev:turbo` | _(none)_ | `next dev --turbopack` |

`npm run build` already used `--webpack`; dev now matches that stable bundler.

`next.config.ts` `turbopack` block is unchanged (harmless when dev uses webpack).

## PWA dev hardening (unchanged from 20C)

- `PwaRegistrar` returns `null` in development
- Dev SW cleanup unregisters without `location.reload()`
- Timezone cookie and auth session dedupe guards intact

## Manual QA

After `pkill -f "next dev"`, `rm -rf .next`, `npm run dev`:

- Startup shows **webpack** mode (not Turbopack)
- Port **3000**
- `/ru/today` idle 90s — no repeated GET spam, no ChunkLoadError
- `/en/today` idle 90s — same

## Known gap

Turbopack can be revisited later via `npm run dev:turbo` once Next/Turbopack stabilizes for this project’s Firebase + next-intl + PWA stack.
