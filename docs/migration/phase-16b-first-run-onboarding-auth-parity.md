# Phase 16B — First-run onboarding and auth entry parity

**Checkpoint:** builds on `eb9c749` / `b6b6e48` (Shopify checkout + Vercel redeploy).

## Issue observed

Signed-out users opening `/en` or `/ru` saw a **dark marketing landing page** (`Daily guidance for a calmer, clearer day`, `A glimpse of today`). This felt like a website, not the Mystic app entry.

## Flutter files inspected (read-only)

| File | Notes |
|------|-------|
| `lib/screens/auth_gate.dart` | Routes: splash → intro onboarding if not complete → welcome auth → app |
| `lib/features/onboarding/onboarding_flow.dart` | 5-step first-run flow before account |
| `lib/screens/welcome_auth_screen.dart` | White background, logo, language toggle, login/register CTAs |
| `lib/screens/login_screen.dart` | Email/password + social providers |
| `lib/core/storage/onboarding_storage.dart` | `onboarding_complete` in SharedPreferences |

## Root route behavior

`src/app/[locale]/page.tsx`:

| State | Destination |
|-------|-------------|
| Signed out, intro not seen | Client redirect → `/{locale}/onboarding` |
| Signed out, intro seen (`mystic_onboarding_seen`) | Client redirect → `/{locale}/login` |
| Signed in, profile incomplete | Server redirect → `/{locale}/onboarding` (profile completion) |
| Signed in, profile complete | Server redirect → `/{locale}/today` |

Dark marketing landing removed from root. Parked at `/{locale}/preview` if needed later.

## First-run onboarding (signed out)

`/{locale}/onboarding` when signed out:

- 4 intro pages (guidance, universe request, reminders, courses)
- White Mystic auth styling, logo on first page
- Final CTAs: **Log in** / **Create account**
- Sets `mystic_onboarding_seen` in `localStorage` before auth
- Skip link to login on early pages

Signed-in users on `/onboarding` see existing **profile completion** flow (name, DOB, language).

## White login screen

`/{locale}/login` — existing `AuthScreen` with:

- `mystic-auth-page` white palette
- Vedunya Maria wordmark + Mystic logo
- Email/password form
- Google (when Firebase configured)
- Apple / Facebook only when env flags are `"true"`
- Language toggle (no “back to landing”)

## Social provider behavior

| Provider | UI | Implementation |
|----------|-----|----------------|
| Google | Always shown when Firebase client configured | `GoogleAuthProvider` (existing) |
| Apple | Hidden unless `NEXT_PUBLIC_ENABLE_APPLE_LOGIN=true` | `OAuthProvider("apple.com")` |
| Facebook | Hidden unless `NEXT_PUBLIC_ENABLE_FACEBOOK_LOGIN=true` | `FacebookAuthProvider` |

No fake clickable Apple/Facebook when disabled.

Setup: `docs/setup/firebase-auth-providers.md`

## Files modified / created

- `src/app/[locale]/page.tsx` — auth gate redirects
- `src/app/[locale]/onboarding/page.tsx` — signed-out intro vs signed-in profile
- `src/app/[locale]/login/page.tsx` — `?mode=register` support
- `src/app/[locale]/preview/page.tsx` — parked marketing landing
- `src/features/onboarding/components/intro-onboarding-flow.tsx`
- `src/features/onboarding/components/intro-onboarding-gate.tsx`
- `src/features/onboarding/utils/intro-onboarding-storage.ts`
- `src/features/auth/components/signed-out-root-redirect.tsx`
- `src/features/auth/components/apple-sign-in-button.tsx`
- `src/features/auth/components/facebook-sign-in-button.tsx`
- `src/features/auth/config/auth-provider-flags.ts`
- `src/features/auth/services/auth-service.ts` — Apple/Facebook OAuth
- `src/features/auth/components/auth-provider-buttons.tsx`
- `src/messages/en.json`, `src/messages/ru.json`
- `.env.example` — social login flags
- Tests: `phase-16b-first-run-onboarding-auth-parity.test.ts`

Removed: `apple-sign-in-placeholder.tsx` (replaced by flag-gated real button)

## Validation

Run before deploy:

```bash
npm run assets:check && npm run lint && npm test && npm run build
```

## Remaining gaps

- Apple/Facebook require Firebase + vendor console setup before enabling flags
- Intro “seen” state is local-only (not security); profile completion still server-side
- `/preview` marketing page is optional; not linked from app shell

## Next step

Screen-by-screen visual QA on production (Phase 16A checkpoint).
