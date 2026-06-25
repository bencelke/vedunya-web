# Phase 18D — Login screen and social auth polish

Premium login/register with Google, Apple, and Facebook (flag-gated).

## Flutter files inspected (read-only)

- `lib/screens/login_screen.dart` — white auth shell, provider buttons, email form
- `lib/screens/welcome_auth_screen.dart` — welcome / entry tone
- `lib/screens/auth_gate.dart` — pre-auth routing
- `lib/features/onboarding/onboarding_flow.dart` — progress + language bar patterns

Flutter was **not modified**.

## Web implementation

| Provider | Firebase API | Visibility |
|----------|--------------|------------|
| Google | `GoogleAuthProvider` | When Firebase Web client is configured |
| Apple | `OAuthProvider("apple.com")` | `NEXT_PUBLIC_ENABLE_APPLE_LOGIN=true` |
| Facebook | `FacebookAuthProvider` | `NEXT_PUBLIC_ENABLE_FACEBOOK_LOGIN=true` |

## Mobile / PWA behavior

- `shouldUseRedirectFlow()` — mobile width, iOS, or standalone PWA → `signInWithRedirect`
- Desktop — `signInWithPopup`; on `auth/popup-blocked` → fallback to `signInWithRedirect`
- `AuthProvider` calls `getRedirectResult` on mount, bootstraps profile, syncs session
- `AuthScreen` routes: complete → `/today`, incomplete → `/onboarding`

## Login UI

- Centered `mystic-login-frame` (~552px), gold-tinted card panel
- Vedunya Maria wordmark + Mystic logo in header
- Social buttons with icons (Google asset, inline Apple/Facebook SVG)
- Email/password below divider; register toggle; forgot password; legal microcopy

## Env flags (`.env.example`)

```env
NEXT_PUBLIC_ENABLE_APPLE_LOGIN=false
NEXT_PUBLIC_ENABLE_FACEBOOK_LOGIN=false
```

Set to `true` only after Firebase + provider OAuth setup is complete.

## Firebase setup

See [firebase-auth-providers.md](../setup/firebase-auth-providers.md).

## Tests

`src/features/auth/tests/phase-18d-login-social-auth-polish.test.ts`
