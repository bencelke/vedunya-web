# Live Firebase Auth Report

## Configuration status

| Check | Status |
|-------|--------|
| Client env present | Pass |
| Admin env present | Pass |
| Project IDs match | Pass |
| Private key newline normalization | Pass |
| `.env.local` Git-ignored | Pass |

Verified via `npm run verify:firebase` (read-only).

## Admin connection status

- Firebase Admin initializes successfully
- Firestore Admin API reachable
- Firebase Auth Admin API reachable

## Expected collections checked

`users`, `user_private`, `runes`, `moon_phases`, `lunar_days`, `notification_copy` — all accessible (existence only, no document contents logged).

## Session cookie architecture

- Route: `POST /api/auth/session`
- Cookie name: `FIREBASE_SESSION_COOKIE_NAME` (default `vedunya_session`)
- HttpOnly: yes
- SameSite: Lax
- Secure: false in local development, true in production
- Max age: ~5 days (`SESSION_COOKIE_MAX_AGE_MS`)
- Stores Firebase **session cookie**, not raw ID token
- ID token freshness check: 5 minutes at session creation

## Profile compatibility

- Public profile read: `users/{uid}` via Admin SDK
- Private profile read: `user_private/{uid}` via Admin SDK
- DOB parsed from Firestore `Timestamp` to date-only parts
- `profileComplete` derived from public or private doc
- Bootstrap uses merge writes only — premium/admin/owner fields protected by `sanitizePublicProfilePatch`

## Bootstrap fix applied

Google **redirect** sign-in now calls `bootstrapUserProfile` after `getRedirectResult`, matching popup/email login behavior. Previously redirect users could miss merge-safe profile bootstrap.

## Route behavior (code-verified)

| Route | Anonymous | Complete user | Incomplete user |
|-------|-----------|---------------|-----------------|
| `/login` | loads | → Today | → Onboarding |
| `/profile` | → login | loads | loads |
| `/onboarding` | → login | → Today | loads |
| `/today` | preview | personalized | setup CTA |

## Auth provider findings

### Email/password

- Firebase client `signInWithEmailAndPassword`
- Merge-safe bootstrap before session cookie
- Localized error mapping (no raw `auth/*` codes in UI)

### Google

- Popup on desktop; redirect on mobile/PWA-like environments
- Redirect bootstrap gap fixed in `auth-provider.tsx`
- Console blockers: unauthorized domain, disabled provider

## Live Firestore content (read-only)

`npm run content:check` result:

- Rune content (`runes/raido`): **Firestore**
- Moon phase content (`moon_phases/waning`): **Firestore**
- Lunar day content (`lunar_days/1`): **Firestore**

## Development diagnostics

- `GET /api/dev/auth-diagnostics` — development only, 404 in production
- Requires verified session cookie
- Returns boolean status only (no UID, email, DOB, premium fields)

## Automated QA

- Unit tests cover configuration status sanitization, auth diagnostics shape, bootstrap merge safety, auth error mapping, locale redirects
- Live Firebase verification remains a separate script (`verify:firebase`)
- Live content check: `npm run content:check`

## Remaining manual steps for Boris

1. **Email login** — test with existing Mystic account in browser at `/en/login`
2. **Google login** — test popup/redirect; add `localhost` to Firebase authorized domains if needed
3. **Session refresh** — reload Today after login
4. **Logout** — confirm cookie clears and protected routes close
5. **Password reset** — submit manually on `/en/forgot-password` only when email receipt is intended
6. **Rotate service account key** if credentials were ever shared in chat

## Remaining blockers

None for Firebase connectivity or Admin reads. Browser login providers require manual verification with real accounts.

## Flutter

Not modified.
