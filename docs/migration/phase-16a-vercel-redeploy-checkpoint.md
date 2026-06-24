# Phase 16A — Vercel redeploy checkpoint

**Date:** 2026-06-24  
**Goal:** Confirm latest `main` is clean, validated, and production-ready for screen-by-screen visual QA.

## Repo state

| Item | Status |
|------|--------|
| Branch | `main` |
| Latest commit (before doc) | `eb9c749` — Add Shopify checkout and verified course entitlements |
| Remote | `https://github.com/bencelke/vedunya-web.git` |
| Working tree | Clean |
| Local vs `origin/main` | In sync (no unpushed commits before this checkpoint doc) |

## Secret safety

- `.env.local` present locally, **ignored** (`!! .env.local`), not staged
- No `.pem`, service account JSON, or tracked `.env` files found
- `.next/`, `node_modules/` ignored
- No secrets committed in checkpoint commits

## Local validation results

| Check | Result |
|-------|--------|
| `npm run assets:check` | Pass |
| `npm run lint` | Pass (1 pre-existing warning in `dev-service-worker-cleanup-script.tsx`) |
| `npm test` | **592 passed** |
| `npm run build` | Pass |
| `npm run verify:firebase` | Pass |
| `npm run content:check` | Pass (Firestore) |
| `npm run sanity:check` | Pass |
| `npm run courses:check` | Pass (28 lessons) |

## Git push

- **Code push needed before doc:** No — `eb9c749` already on `origin/main`
- **Checkpoint doc commit:** Yes — this file triggers a safe redeploy marker
- **Empty redeploy commit:** Not used (doc commit preferred over `--allow-empty`)

## Vercel redeploy method

1. **Preferred for Boris (manual):** Vercel → Project `vedunya-web` → Deployments → latest production → **Redeploy** (turn **Use existing Build Cache** OFF if a prior deploy looked broken)
2. **Git-triggered:** Push checkpoint doc commit on `main` (auto-deploy if Vercel Git integration is enabled)

Vercel CLI is not installed in the local environment; dashboard redeploy remains available as fallback.

## Production URL

```text
https://vedunya-web.vercel.app
```

Custom domain `app.vedunya.com` is a later step.

## Vercel env checklist (names only — confirm in dashboard)

Boris must confirm these exist in **Production** and **Preview** (values not listed here):

### Firebase Web

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

### Firebase Admin

- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`
- `FIREBASE_SESSION_COOKIE_NAME`

### Push / Cron / PWA

- `NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY`
- `WEB_PUSH_PRIVATE_KEY`
- `WEB_PUSH_SUBJECT`
- `SCHEDULED_REMINDERS_SECRET`
- `CRON_SECRET` (same value as reminders secret if using Vercel Cron bearer)
- `NEXT_PUBLIC_ENABLE_PWA`

### Shopify (course checkout — optional until Shopify admin is configured)

- `SHOPIFY_STORE_DOMAIN`
- `SHOPIFY_API_VERSION`
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN`
- `SHOPIFY_ADMIN_ACCESS_TOKEN`
- `SHOPIFY_WEBHOOK_SECRET`
- `SHOPIFY_LIVING_THE_RUNES_VARIANT_ID`
- `SHOPIFY_CURRENCY`
- `NEXT_PUBLIC_APP_URL`

### Sanity (optional)

- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `NEXT_PUBLIC_SANITY_API_VERSION`
- `SANITY_READ_TOKEN`

**Automated verification of Vercel dashboard env vars was not possible from this session.** Treat unconfirmed vars as manual blockers for auth, push, cron, and Shopify checkout.

## Vercel Hobby cron (deploy blocker)

Production deploy was blocked on Hobby because `vercel.json` used `*/15 * * * *` (every 15 minutes). **Vercel Hobby allows daily cron jobs only.**

| Item | Value |
|------|--------|
| Route | `/api/cron/send-reminders` |
| Hobby schedule | `0 9 * * *` (daily 09:00 UTC) |
| Pro / external | `*/15 * * * *` or equivalent for 15-minute dispatch |

On Vercel Hobby, scheduled reminders use a daily cron only. **15-minute** reminder dispatch requires **Vercel Pro** or another scheduler. The API route remains available. This is a deployment compatibility change, not a product behavior upgrade.

Fixed in commit after `47f47ca` — see `vercel.json` and `docs/migration/phase-14-scheduled-notification-dispatch.md`.

## Firebase authorized domains

**Manual confirmation required** in Firebase Console → Authentication → Settings → Authorized domains:

| Domain | When |
|--------|------|
| `vedunya-web.vercel.app` | **Required now** for Vercel QA |
| `app.vedunya.com` | When custom domain is configured |

Cannot be verified from code. If login fails on production with `auth/unauthorized-domain`, add the Vercel hostname.

## Production smoke test

```bash
PRODUCTION_URL=https://vedunya-web.vercel.app npm run smoke:production
```

**Result (pre-doc commit):** 32/32 passed — no HTTP failures.

Routes checked include:

- `/en`, `/ru`, login, today, profile, courses, living-the-runes, legal, manifest, `sw.js`, and related EN/RU pairs

Observations:

- App responds on Vercel (`server: Vercel` header)
- No 500s or fetch failures in automated smoke
- Manifest includes Mystic name
- Service worker file present with expected patterns
- Profile/today routes return expected HTTP status (auth-protected routes may redirect — smoke accepts 2xx/3xx)

Signed-in flows (Today depth, Profile data) require manual browser QA.

## Remaining blockers

| Blocker | Owner | Notes |
|---------|-------|-------|
| Vercel env var confirmation | Boris | Dashboard review — especially Shopify vars if testing checkout |
| Firebase authorized domain | Boris | Confirm `vedunya-web.vercel.app` is listed |
| Shopify admin setup | Boris | Product, webhook, tokens — see Phase 15 doc |
| Custom domain `app.vedunya.com` | Later | Not required for initial screen QA on `*.vercel.app` |

No code defects identified during validation or smoke test.

## Next step

**Screen-by-screen visual QA** — Boris sends one screen at a time for polish review. No new features or UI polish in Phase 16A.
