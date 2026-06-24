# Phase 13 — Vercel deployment and real device QA

Deploy Mystic / Vedunya Web to Vercel, connect Firebase safely, and validate on real devices.

**Checkpoint:** `0738717` — Complete Mystic prototype parity and trust surfaces

## Repo pre-flight (completed)

| Check | Result |
|-------|--------|
| Branch | `main` |
| Commit | `0738717` |
| Working tree | Clean |
| Remote | `bencelke/vedunya-web` |
| `assets:check` | Pass |
| `lint` | Pass (1 pre-existing PWA warning) |
| `test` | 542 passed |
| `build` | Pass |
| `verify:firebase` | Pass (local) |
| `content:check` | Pass |
| `sanity:check` | Pass |
| `courses:check` | Pass |

## Environment variable checklist

`.env.example` matches all env vars used in code:

| Group | Variables | Required for auth/Today |
|-------|-----------|------------------------|
| Firebase Web | `NEXT_PUBLIC_FIREBASE_*` (7 keys incl. `MEASUREMENT_ID`) | Yes (6 required; measurement optional) |
| Firebase Admin | `FIREBASE_ADMIN_*`, `FIREBASE_SESSION_COOKIE_NAME` | Yes |
| Sanity | `NEXT_PUBLIC_SANITY_*`, `SANITY_READ_TOKEN` | Optional (code defaults exist) |
| Web Push | `NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY`, `WEB_PUSH_PRIVATE_KEY`, `WEB_PUSH_SUBJECT` | Optional |
| PWA | `NEXT_PUBLIC_ENABLE_PWA` | Optional (enabled in prod unless `"false"`) |

**Do not commit values.** Add real values only in Vercel dashboard → Project → Settings → Environment Variables (Production + Preview).

See `docs/setup/vercel-deployment.md` and `docs/setup/firebase-production-domain-checklist.md`.

## Vercel deployment status

| Item | Status |
|------|--------|
| Production URL | **Not deployed yet** — no project found at common hostnames (`vedunya-web.vercel.app`, `vedunya-web-bencelke.vercel.app` returned 404) |
| Vercel CLI | Not linked (`.vercel/` absent); dashboard import required |
| Build command | `npm run build` |
| Install command | `npm install` |

### Manual steps required (dashboard)

1. [Vercel](https://vercel.com) → **Add New → Project** → import `bencelke/vedunya-web`
2. Framework: **Next.js**, root: repo root
3. Add all env var **names** from `.env.example` with real values (Production + Preview)
4. Deploy and record production URL

## Firebase authorized domain status

| Domain | Status |
|--------|--------|
| `localhost` | Assumed present (local dev works) |
| Vercel production hostname | **Pending** — add after first deploy |
| `app.vedunya.com` | **Pending** — add when custom domain is configured |

**Firebase Console → Authentication → Settings → Authorized domains** — add exact Vercel hostname (no wildcard).

## Google login status

| Environment | Status |
|-------------|--------|
| Local | Not re-tested in this phase (previously working with `verify:firebase`) |
| Vercel production | **Pending** — requires deploy + authorized domain + OAuth JavaScript origins |

If Google sign-in fails on Vercel, check:

- Firebase authorized domains
- Google Cloud → Credentials → Web client → Authorized JavaScript origins (`https://<vercel-host>`)

## Core route smoke test

| Environment | Result |
|-------------|--------|
| Local build | Pass (45 routes in `npm run build` output) |
| Vercel production | **Pending** — run after deploy |

### Automated smoke script (post-deploy)

```bash
PRODUCTION_URL=https://<your-vercel-host>.vercel.app npm run smoke:production
```

Checks 30+ localized routes plus `/manifest.webmanifest` and `/sw.js`.

## Real device QA

Real iPhone and Android testing **requires a deployed HTTPS URL**. Not completed in this session — record results below after deploy.

### iPhone Safari (tab)

| Check | Result |
|-------|--------|
| Site loads | _Pending_ |
| Login works | _Pending_ |
| Today loads | _Pending_ |
| Profile loads | _Pending_ |
| Push not promised in Safari tab | Expected honest copy |

### iPhone Home Screen PWA

| Check | Result |
|-------|--------|
| Add to Home Screen | _Pending_ |
| Standalone launch | _Pending_ |
| Session persists | _Pending_ |
| Offline page | _Pending_ |

### iPhone notification readiness

| Check | Result |
|-------|--------|
| Install requirement copy | _Pending_ |
| Enable reminders (user action) | _Pending_ |
| Test notification | _Pending_ |
| Scheduler honesty | Expected — no fake scheduled delivery |

### Android Chrome / PWA

| Check | Result |
|-------|--------|
| Site loads | _Pending_ |
| Install / PWA | _Pending_ |
| Reminders | _Pending_ |
| Test notification | _Pending_ |

### Desktop production QA

| Check | Result |
|-------|--------|
| Login / onboarding / Today | _Pending_ |
| Request create/edit/pause | _Pending_ |
| Moon / Rune / Courses / Profile | _Pending_ |
| Legal/support pages | _Pending_ |
| Logout / login again | _Pending_ |

## Production bugs found

### Root cause (fixed in code)

Vercel runtime logs showed HTTP 500 on dynamic routes (`/ru`, `/ru/login`, `/en/today`, etc.) with:

```text
ERR_REQUIRE_ESM: require() of ES Module jose from jwks-rsa (firebase-admin auth chain)
```

Next.js 16 Turbopack production bundle failed to load `firebase-admin` on Vercel. Static SSG pages (`/en/about`, `/manifest.webmanifest`) returned 200.

**Fix:** `serverExternalPackages: ["firebase-admin"]` in `next.config.ts` and `next build --webpack` for production builds.

### Secondary issue (Vercel dashboard, not code)

Deployment URL `vedunya-lbhm772kt-...vercel.app` may redirect to Vercel SSO if **Deployment Protection** is enabled. Disable for public prototype testing, or use the production alias after fix.

## Fixes made in Phase 13

| File | Change |
|------|--------|
| `scripts/production-smoke-check.ts` | New post-deploy route smoke checker |
| `package.json` | Added `smoke:production` script |
| `docs/setup/vercel-deployment.md` | Updated checkpoint to `0738717`, added `MEASUREMENT_ID`, smoke script docs |

No production blocker code fixes required yet.

## Commit / push

No commit in this phase — deployment tooling and docs are local until Vercel deploy is confirmed and device QA is recorded.

## Security confirmations

- `.env.local` not committed
- No secrets in docs or new scripts
- Flutter not modified

## Remaining blockers

1. **Vercel project not created / not deployed** — manual dashboard action
2. **Firebase authorized domain** — add Vercel hostname after deploy
3. **Google OAuth origins** — if Google sign-in fails on production
4. **Real device QA** — iPhone Safari, Home Screen PWA, Android Chrome after HTTPS URL exists
5. **VAPID keys on Vercel** — optional; required only for push test on production

## Ready for Phase 14?

**Not yet.** Phase 14 (scheduled notification dispatch) should wait until:

- Vercel production URL is live
- Firebase authorized domain is configured
- Login/session works on production
- Core routes pass `smoke:production`
- Real device PWA/push limitations are documented from actual testing

## Next action

1. Deploy on Vercel (dashboard steps above)
2. Add Vercel hostname to Firebase authorized domains
3. Run `PRODUCTION_URL=... npm run smoke:production`
4. Complete iPhone + Android QA checklists in this doc
5. Update this file with results, then proceed to Phase 14 planning
