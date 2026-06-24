# Firebase production domain checklist

Use this checklist when deploying Vedunya Web / Mystic to Vercel (or any HTTPS host). These steps are manual in Firebase Console and Google Cloud Console — they cannot be applied from this repo.

Do not commit secrets. Do not paste service account JSON into Git.

## Before first production deploy

- [ ] Firebase Web app registered (same project as Mystic mobile)
- [ ] All `NEXT_PUBLIC_FIREBASE_*` values added to Vercel **Production** and **Preview** env
- [ ] Firebase Admin service account values added to Vercel (server-only, never `NEXT_PUBLIC_`)
- [ ] `FIREBASE_ADMIN_PROJECT_ID` matches `NEXT_PUBLIC_FIREBASE_PROJECT_ID`

## Authorized domains (Firebase Auth)

**Firebase Console → Authentication → Settings → Authorized domains**

Add each hostname users will open in the browser:

| Domain | When to add |
|--------|-------------|
| `localhost` | Local development (usually pre-listed) |
| `*.vercel.app` | Not supported as a wildcard — add each deployment hostname |
| `<project>-<team>.vercel.app` | Default Vercel production URL after first deploy |
| `<branch>-<project>-<team>.vercel.app` | Preview deployments (optional, for testing PRs) |
| `app.vedunya.com` | When custom domain is configured |

Steps:

1. Open **Authentication → Settings → Authorized domains**.
2. Click **Add domain**.
3. Enter the exact hostname (no `https://`, no path).
4. Repeat for production URL, preview URL (if needed), and `app.vedunya.com` when ready.

Without this step, Firebase Auth (email, Google popup/redirect) will fail on the deployed origin.

## Sign-in providers

**Firebase Console → Authentication → Sign-in method**

- [ ] **Email/Password** — Enabled
- [ ] **Google** — Enabled, support email configured

## Google OAuth (if Google sign-in fails on production)

Google sign-in may also require OAuth client configuration in **Google Cloud Console** (same project linked to Firebase):

1. **APIs & Services → Credentials**
2. Open the **Web client** used by Firebase Auth (often auto-created)
3. Under **Authorized JavaScript origins**, add:
   - `https://<your-vercel-hostname>.vercel.app`
   - `https://app.vedunya.com` (when custom domain is live)
4. Under **Authorized redirect URIs**, ensure Firebase Auth callback URIs are present (Firebase usually manages `https://<project-id>.firebaseapp.com/__/auth/handler`)

If origins are missing, Google sign-in can work on `localhost` but fail on Vercel with a browser OAuth error.

## Session cookies (server)

The app uses HttpOnly session cookies via Firebase Admin (`POST /api/auth/session`).

- Cookies are `secure` in production (`NODE_ENV=production`).
- Deployed site **must** be served over HTTPS (Vercel provides this by default).
- No extra Firebase setting is required beyond authorized domains.

## Firestore / Admin access

- Service account used for `FIREBASE_ADMIN_*` must have Firestore access in the Mystic project.
- Do not change Firestore security rules as part of deployment unless separately planned.
- Existing `users/{uid}` and `user_private/{uid}` contracts are unchanged.

## Web Push (optional)

If `NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY` and `WEB_PUSH_PRIVATE_KEY` are set on Vercel:

- Push subscription APIs require an authenticated session.
- Real iPhone testing needs **HTTPS** and **Add to Home Screen** PWA — see `docs/setup/web-push-vapid-setup.md`.

## Post-deploy smoke test

- [ ] `/en/login` loads without Firebase config error
- [ ] Email sign-in creates session (check `/en/today` redirect)
- [ ] Google sign-in works on production URL
- [ ] `/en/profile` loads for signed-in user
- [ ] `/manifest.webmanifest` returns JSON with `Mystic by Vedunya Maria`
- [ ] `/en/offline` loads when navigated directly

## Related docs

- `docs/setup/firebase-web-setup.md` — initial Firebase + local setup
- `docs/setup/vercel-deployment.md` — Vercel import and env vars
- `docs/setup/web-push-vapid-setup.md` — VAPID keys for reminders
