# Phase 18E.4 — Auth social buttons + brand consistency

## Current issue

Local visual QA showed:
1. Only Google visible on login — **expected** when `NEXT_PUBLIC_ENABLE_APPLE_LOGIN` and `NEXT_PUBLIC_ENABLE_FACEBOOK_LOGIN` are false/unset
2. Apple/Facebook “missing” — hidden by env flags, not absent from codebase
3. Login vs register felt too similar — copy differed but layout/brand did not
4. Auth brand `MYSTIC by Vedunya Maria` used oversized `mystic-auth-wordmark` (1.5rem / 0.32em) vs onboarding’s compact `mystic-brand-wordmark`

## Files changed

### New
- `src/components/brand/mystic-brand-header.tsx` — shared brand + logo
- `src/features/auth/config/social-auth-providers.ts` — provider availability helper
- `src/features/auth/components/social-auth-button.tsx` — unified social button
- `src/features/auth/tests/phase-18e4-auth-social-brand-fix.test.ts`
- `docs/migration/phase-18e4-auth-social-brand-fix.md`

### Modified
- `auth-brand-header.tsx` — uses `MysticBrandHeader`, calmer title sizing
- `intro-brand-header.tsx`, `onboarding-flow.tsx` — shared brand component
- `auth-provider-buttons.tsx` — explicit provider list from config
- `google/apple/facebook-sign-in-button.tsx` — thin wrappers
- `auth-screen.tsx` — `auth-screen--login` / `--register` classes, deduped effect
- `mystic-theme.css` — unified wordmark, social button polish, register accent
- Tests: 18d, 18e3, auth-ui-parity, phase-9-4, phase-16b
- `docs/setup/firebase-auth-providers.md`

## Provider behavior

| Provider | Shown when | Implementation |
|----------|------------|----------------|
| Google | Firebase client configured | `GoogleAuthProvider` |
| Apple | `NEXT_PUBLIC_ENABLE_APPLE_LOGIN=true` | `OAuthProvider("apple.com")` |
| Facebook | `NEXT_PUBLIC_ENABLE_FACEBOOK_LOGIN=true` | `FacebookAuthProvider` |

- Popup desktop; redirect mobile/PWA; popup-blocked fallback
- No fake clickable buttons when flags false — providers omitted from render
- `data-enabled-providers` on button group for debugging/tests

## Env flag behavior

Default in `.env.example`: both flags `false` → **only Google** in UI.

Boris must add to `.env.local` manually (not edited by agent):

```env
NEXT_PUBLIC_ENABLE_APPLE_LOGIN=true
NEXT_PUBLIC_ENABLE_FACEBOOK_LOGIN=true
```

## Brand unification

`MysticBrandHeader` shared across intro onboarding, auth login/register, and post-auth completion shell. Wordmark: `0.6875rem`, gold, uppercase, balanced wrap — matches onboarding.

## Pre-auth DOB handoff

Unchanged — register social success → `handleRegisterSuccess` → forced onboarding; no draft clearing on auth screen.

## Validation

| Command | Result |
|---------|--------|
| `npm run lint` | Pass |
| `npm test` | Pass |
| `npm run build` | Pass |

## Remaining setup for Apple/Facebook

Firebase Console provider enablement + Meta/Apple developer OAuth setup required before production use. See `docs/setup/firebase-auth-providers.md`.
