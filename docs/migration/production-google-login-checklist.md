# Production Google login checklist

Manual steps for Google sign-in on deployed Vedunya Web / Mystic. Firebase Console and Google Cloud Console cannot be configured from this repo.

## Firebase Console

**Project:** `mystic-app-fb9ce`

### Sign-in method

**Authentication → Sign-in method**

- [ ] **Email/Password** — Enabled
- [ ] **Google** — Enabled, support email configured

### Authorized domains

**Authentication → Settings → Authorized domains**

Add each exact hostname (no `https://`, no path):

- [ ] `localhost`
- [ ] `mystic-app-fb9ce.firebaseapp.com`
- [ ] `vedunya-web.vercel.app`
- [ ] `app.vedunya.com` (when custom domain is live)

Without `vedunya-web.vercel.app`, Google redirect and popup auth fail on the Vercel URL.

## Google Cloud Console

**Project:** `mystic-app-fb9ce`

**APIs & Services → Credentials → OAuth 2.0 Web client** (Firebase Auth web client)

### Authorized JavaScript origins

- [ ] `http://localhost`
- [ ] `http://localhost:3000`
- [ ] `http://localhost:5000`
- [ ] `https://mystic-app-fb9ce.firebaseapp.com`
- [ ] `https://vedunya-web.vercel.app`
- [ ] `https://app.vedunya.com` (when custom domain is live)

### Authorized redirect URIs

- [ ] `https://mystic-app-fb9ce.firebaseapp.com/__/auth/handler`

Firebase manages the handler URI; do not remove it.

## OAuth consent screen

**APIs & Services → OAuth consent screen**

- [ ] App name and support email configured
- [ ] If **Publishing status** is **Testing**, the Google account used for login must be listed under **Test users**

## Vercel environment

Production must include all Firebase Web + Admin variables from `.env.example`. After changing env vars, **redeploy**.

Optional safe client diagnostics:

```env
NEXT_PUBLIC_AUTH_DEBUG=true
```

Logs only safe `[google-auth]` events — never tokens, emails, or cookies.

## Post-deploy QA

- [ ] `https://vedunya-web.vercel.app/ru/login` — Google on phone (redirect)
- [ ] `https://vedunya-web.vercel.app/en/login` — Google on desktop (popup or redirect)
- [ ] After Google return: `POST /api/auth/session` → **200**
- [ ] Redirect to `/ru/today` or `/ru/onboarding` as appropriate
- [ ] Refresh `/ru/today` stays signed in
- [ ] Email/password login still works

## Related docs

- `docs/setup/firebase-production-domain-checklist.md`
- `docs/setup/firebase-auth-providers.md`
- `docs/setup/vercel-deployment.md`
