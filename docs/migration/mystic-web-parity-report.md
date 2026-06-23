# Mystic Web Parity Report

Date: 2026-06-23  
Project: `vedunya-web`

## Flutter source

| Item | Value |
|------|-------|
| MacBook `mystic_app` | **Not found** |
| Reference audit | `mystic-source-audit.md` (read-only, 2026-06-13) |
| Flutter modified | **No** |

## Screens rebuilt (web)

| Screen | Key files |
|--------|-----------|
| Login / register | `auth-screen.tsx`, `login-form.tsx`, `register-form.tsx`, `google-sign-in-button.tsx` |
| Forgot password | `forgot-password/page.tsx`, `forgot-password-form.tsx` |
| Onboarding | `onboarding-flow.tsx`, `onboarding/page.tsx` |
| App shell | `app-shell.tsx`, `app-header.tsx`, `bottom-navigation.tsx` |
| Today | `daily-guidance-header.tsx`, `primary-guidance-card.tsx`, `daily-rune-summary.tsx` |
| Profile | `profile-content.tsx` |

## Design system added

| File | Role |
|------|------|
| `src/styles/mystic-theme.css` | Auth light theme + app background utilities |
| `src/config/theme.ts` | Central tokens and asset paths |
| `src/components/ui/auth-shell.tsx` | Auth + onboarding shells, progress |
| `src/components/ui/input.tsx`, `label.tsx` | Shared form primitives |
| `src/components/brand/mystic-logo.tsx` | Mystic wordmark / makosh |

## Theme decisions

- **Auth/onboarding:** ivory/gold premium (`mystic-auth-page`)
- **App interior:** dark Mystic with background JPG overlay
- **No full-app white theme** — matches documented production direction

## Logic preserved

- Firebase auth + session cookies
- Sujok numerology, moon engine, rune selector
- Firestore profile contracts
- EN/RU routing

## Tests added

`src/features/auth/tests/mystic-ui-parity.test.ts` — navigation tabs, theme assets, profile privacy.

## Remaining gaps

1. Insights tab experience
2. Premium paywall / Mystic Plus UI
3. Landing page Mystic brand depth
4. PWA splash / install chrome
5. Live Flutter screenshot validation on MacBook when `mystic_app` is available

## Next recommended stage

**PWA install foundation, then Web Push notifications.**
