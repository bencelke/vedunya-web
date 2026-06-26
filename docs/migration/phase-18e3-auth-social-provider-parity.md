# Phase 18E.3 — Auth screen mode clarity + social provider parity

## Old issue

- Login and Create account screens looked nearly identical (same social button copy, similar subtitles).
- Apple and Facebook buttons were **missing** because `NEXT_PUBLIC_ENABLE_APPLE_LOGIN` and `NEXT_PUBLIC_ENABLE_FACEBOOK_LOGIN` default to `false` in `.env.example` — not because code was absent.
- Google was visible (no extra flag required when Firebase is configured).
- Register-mode social sign-in always used the login success handler, skipping forced onboarding routing for new accounts.

## Mode clarity changes

| Element | Sign in | Create account |
|---------|---------|----------------|
| Title | Sign in / Войти | Create account / Создать аккаунт |
| Subtitle | Continue daily practice | Save birth date + personal rhythm |
| Google | Continue with Google | Create account with Google |
| Apple | Continue with Apple | Create account with Apple |
| Facebook | Continue with Facebook | Create account with Facebook |
| Primary CTA | Sign in | Create account |
| Secondary | Create account | Already have an account? Sign in |
| Forgot password | Yes | Hidden |

- `data-auth-mode` on auth screen container
- URL sync: `/login` vs `/login?mode=register` via `useSearchParams` + `setAuthMode`
- Register page metadata title via `registerMetaTitle`

## Apple / Facebook implementation status

**Already implemented** in Phase 18D; verified and wired in 18E.3:

| Provider | Firebase API | Visibility |
|----------|--------------|------------|
| Google | `GoogleAuthProvider` | When Firebase client configured |
| Apple | `OAuthProvider("apple.com")` | `NEXT_PUBLIC_ENABLE_APPLE_LOGIN=true` |
| Facebook | `FacebookAuthProvider` | `NEXT_PUBLIC_ENABLE_FACEBOOK_LOGIN=true` |

- Popup on desktop; redirect on mobile/PWA/iOS/standalone
- Popup-blocked → redirect fallback
- `AuthProvider` handles `getRedirectResult` + profile bootstrap
- Friendly error mapping (cancelled, not configured, unauthorized domain)

## Env flags

In `.env.example` (names only):

```env
NEXT_PUBLIC_ENABLE_APPLE_LOGIN=false
NEXT_PUBLIC_ENABLE_FACEBOOK_LOGIN=false
```

To preview locally after Firebase setup, Boris can set both to `true` in `.env.local` and restart dev — **do not commit `.env.local`**.

## Files changed

- `auth-screen.tsx` — mode from URL, register social routing, `data-auth-mode`
- `auth-provider-buttons.tsx` — `mode` prop, conditional Apple/Facebook
- `google/apple/facebook-sign-in-button.tsx` — mode-specific labels
- `login/page.tsx` — register metadata title
- `en.json`, `ru.json` — mode copy + `registerContinue` social labels
- `docs/setup/firebase-auth-providers.md` — local preview note
- Tests: `phase-18e3-auth-social-provider-parity.test.ts` (new), `phase-18d`, `auth-ui-parity`

## Pre-auth DOB handoff

- Auth screen does **not** clear `vedunya_preauth_onboarding_draft`
- Register mode (email or social) → `handleRegisterSuccess` → `redirectAfterAuth(true)` → onboarding for DOB migration
- Login mode → profile-status based routing to Today or onboarding

## Tests

**New:** `phase-18e3-auth-social-provider-parity.test.ts` (21 assertions)  
**Updated:** phase-18d, auth-ui-parity

## Validation results

| Command | Result |
|---------|--------|
| `npm run lint` | Pass (1 pre-existing PWA warning) |
| `npm test` | **815/815 pass** |
| `npm run build` | Pass |

## Manual QA

Not run interactively in this session. Recommended:

- `/en/login` vs `/en/login?mode=register` — titles, subtitles, social labels differ
- Apple/Facebook hidden with default flags
- Set flags in `.env.local` to preview buttons

## Known gaps

- Apple/Facebook require Firebase Console + provider OAuth setup before they work in production
- Social register still routes through onboarding even if profile auto-completes from pre-auth DOB + displayName (by design for register handoff)
