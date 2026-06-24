# Vercel deployment — Vedunya Web live prototype

Deploy Mystic by Vedunya Maria as an HTTPS prototype for real-device PWA testing (iPhone/Android).

**Repo:** `https://github.com/bencelke/vedunya-web`  
**Checkpoint:** `0738717` and later on `main`

Do not commit secrets. Add all sensitive values only in Vercel project settings or local `.env.local`.

## Prerequisites

- GitHub repo pushed and up to date on `main`
- Firebase project (same as Mystic mobile) with Web app registered
- Firebase Admin service account for server sessions
- Optional: VAPID keys for Web Push reminders (`docs/setup/web-push-vapid-setup.md`)

## 1. Import project into Vercel

1. Sign in to [Vercel](https://vercel.com).
2. **Add New → Project**.
3. Import `bencelke/vedunya-web` from GitHub.
4. Confirm **Production Branch** is `main`.

## 2. Framework settings

| Setting | Value |
|---------|--------|
| Framework Preset | **Next.js** |
| Root Directory | `.` (repo root) |
| Build Command | `npm run build` (uses `next build --webpack` for Firebase Admin compatibility on Vercel) |
| Install Command | `npm install` |
| Output Directory | *(default — leave empty)* |
| Node.js Version | 20.x or 22.x (Vercel default is fine) |

No custom `vercel.json` is required for this app.

## 3. Environment variables

In **Project → Settings → Environment Variables**, add every name from `.env.example`.

Apply to **Production** and **Preview** (and **Development** only if using `vercel dev`).

### Required for auth + Today

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
FIREBASE_SESSION_COOKIE_NAME=vedunya_session
```

**`FIREBASE_ADMIN_PRIVATE_KEY` on Vercel:** paste the full PEM including `-----BEGIN PRIVATE KEY-----` / `-----END PRIVATE KEY-----`. Use real newlines or `\n` escapes — match how it works in your local `.env.local`.

### Optional — Sanity CMS

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=
NEXT_PUBLIC_SANITY_API_VERSION=
SANITY_READ_TOKEN=
```

App runs with code defaults if unset; token only needed for private Sanity reads.

### Optional — Web Push reminders

```env
NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY=
WEB_PUSH_PRIVATE_KEY=
WEB_PUSH_SUBJECT=mailto:support@vedunya.com
```

Generate keys locally: `npx web-push generate-vapid-keys` (see `docs/setup/web-push-vapid-setup.md`).

### Optional — PWA toggle

```env
NEXT_PUBLIC_ENABLE_PWA=
```

- Unset or any value except `"false"` → PWA + service worker **enabled in production**
- `false` → disables service worker registration in production builds

PWA is **always disabled in local `npm run dev`** regardless of this flag.

## 4. Deploy

1. Click **Deploy**.
2. Wait for build to finish (`npm run build` must pass).
3. Note the production URL, e.g. `https://vedunya-web.vercel.app`.

## 5. Firebase authorized domains

After the first deploy, add the Vercel hostname to Firebase Auth authorized domains.

See **`docs/setup/firebase-production-domain-checklist.md`** for step-by-step Console instructions and Google OAuth origin notes.

Minimum:

- Add your `*.vercel.app` production hostname
- Add `app.vedunya.com` when custom domain is configured

## 6. Custom domain (later)

1. Vercel → **Project → Settings → Domains**
2. Add `app.vedunya.com`
3. Configure DNS per Vercel instructions
4. Add `app.vedunya.com` to Firebase **Authorized domains**
5. Add `https://app.vedunya.com` to Google OAuth **Authorized JavaScript origins** if Google sign-in is used

## 7. PWA behavior in production

| Item | Production behavior |
|------|---------------------|
| Manifest | `/manifest.webmanifest` (from `src/app/manifest.ts`) |
| Service worker | `public/sw.js` registered when `isPwaEnabled` |
| Offline shell | `/en/offline`, `/ru/offline` pre-cached |
| API routes | **Not cached** (`/api/*`, Firebase auth URLs excluded in SW) |
| Dev | PWA disabled; `/sw.js` rewritten to noop in dev |

**Install testing:** Profile → Install Mystic on this phone (or browser install prompt on supported Android/desktop).

> **Real iPhone Web Push testing requires HTTPS and an installed Home Screen PWA.**

Push permission is **not** requested automatically on page load — only when the user taps **Enable reminders** in Profile.

## 8. Post-deploy QA checklist

- [ ] `https://<host>/en` and `/ru` load
- [ ] `https://<host>/manifest.webmanifest` returns valid JSON
- [ ] Login (email) → onboarding or Today
- [ ] Google sign-in on production URL
- [ ] Today, Moon, Rune detail, Courses, Profile render
- [ ] RU routes show Russian UI copy
- [ ] Offline page: `/en/offline`
- [ ] PWA install from Profile (production HTTPS)
- [ ] Optional: test notification after enabling reminders

## Post-deploy automated smoke check

After the first deploy, run from your machine (no secrets required):

```bash
PRODUCTION_URL=https://<your-vercel-host>.vercel.app npm run smoke:production
```

This checks core routes, `/manifest.webmanifest`, and `/sw.js` HTTP status and basic shape.

## 9. Security reminders

- Never paste secrets into GitHub, issues, or commit messages
- Never commit `.env.local`, `*.pem`, or `*serviceAccount*.json`
- `WEB_PUSH_PRIVATE_KEY` and `FIREBASE_ADMIN_PRIVATE_KEY` are server-only
- `/api/dev/auth-diagnostics` returns 404 in production

## 10. Vercel CLI (optional)

Vercel CLI is not required. Dashboard import is sufficient.

If you install CLI locally and link the project:

```bash
npx vercel link
npx vercel env pull .env.local   # optional — review before use
npx vercel --prod                # deploy from local machine
```

Do not run production deploys until env vars are configured in the Vercel dashboard.

## Related docs

- `.env.example` — variable names only
- `docs/setup/firebase-production-domain-checklist.md`
- `docs/setup/firebase-web-setup.md`
- `docs/setup/web-push-vapid-setup.md`
- `docs/migration/phase-8-pwa-install-foundation.md`
- `docs/migration/phase-9-web-push-notifications.md`

## Next phase

**Phase 12 — Real device QA** on the deployed HTTPS prototype (iPhone Home Screen PWA, Android install, push reminders, offline shell).
