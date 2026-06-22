# Live Firebase Auth QA Checklist

Manual verification for Boris. Do not record credentials, UIDs, emails, or DOB values in this document.

## Environment

- [ ] `npm run verify:firebase` passes
- [ ] `clientConfigured: true`, `adminConfigured: true`, `projectIdsMatch: true`
- [ ] `.env.local` exists locally and is Git-ignored
- [ ] `.env.local` does not appear in `git status`

## Email login

- [ ] Open `/en/login`
- [ ] Sign in with an existing Mystic email/password account
- [ ] No raw Firebase error codes shown in UI
- [ ] Redirect goes to `/en/today` (complete profile) or `/en/onboarding` (incomplete)
- [ ] Refresh page — session remains authenticated
- [ ] `/api/auth/me` returns a user object (browser network tab — do not share response)
- [ ] Today loads personalized numerology, Moon, and rune when profile is complete
- [ ] Profile page shows name and birth date
- [ ] Premium/admin fields unchanged in Firestore (verify in console if needed)

## Google login

- [ ] Open `/en/login`
- [ ] Click Continue with Google
- [ ] If `auth/unauthorized-domain`: add `localhost` in Firebase Console → Authentication → Settings → Authorized domains
- [ ] If provider disabled: enable Google in Firebase Console → Authentication → Sign-in method
- [ ] Successful sign-in creates session and redirects correctly
- [ ] No duplicate `users/{uid}` or `user_private/{uid}` documents created
- [ ] Mobile/PWA uses redirect flow without losing profile bootstrap

## Profile

- [ ] `/en/profile` loads for authenticated user
- [ ] Display name visible
- [ ] Birth date visible (when set)
- [ ] Language visible
- [ ] Edit profile saves allowed fields only
- [ ] Premium/admin fields not exposed for client editing

## Routes

### Anonymous

- [ ] `/en/profile` → redirects to `/en/login`
- [ ] `/en/onboarding` → redirects to `/en/login`

### Authenticated complete

- [ ] `/en/login` → redirects to `/en/today`
- [ ] `/en/onboarding` → redirects to `/en/today`
- [ ] `/en/profile` loads

### Authenticated incomplete

- [ ] Login → `/en/onboarding`
- [ ] `/en/today` shows setup CTA (no fake personal data)

### Locales

- [ ] Repeat key checks on `/ru/login`, `/ru/today`, `/ru/profile`

## Logout

- [ ] Profile → Sign out
- [ ] `/api/auth/me` returns `{ user: null }`
- [ ] `/en/profile` redirects to login
- [ ] Browser back does not show authenticated profile content

## Password reset

- [ ] `/en/forgot-password` loads
- [ ] Invalid email shows validation message
- [ ] Valid email shows generic success copy (no account enumeration)
- [ ] Return to login link works
- [ ] Submit reset manually only when you intend to receive email

## Development diagnostics (after login)

- [ ] `GET /api/dev/auth-diagnostics` returns booleans only (development mode)
- [ ] Response includes `profileComplete`, `dobPresent`, `publicProfileExists`
- [ ] Response does not include UID, email, DOB, or document bodies
- [ ] Same endpoint returns 404 when `NODE_ENV=production`

## Live content (read-only)

- [ ] `npm run content:check` reports Firestore or fallback sources
- [ ] Canonical rune path uses `raido`, not `raidho`

## Data safety

- [ ] Existing DOB not reset after login
- [ ] `profileComplete` not reset after login
- [ ] Premium fields not reset after login
- [ ] Admin/owner fields not reset after login
- [ ] No destructive full-document overwrites on login
