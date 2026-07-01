# Phase 26A — Install Mystic education page

## Summary

Adds a dedicated, localized install education route at `/{locale}/install` that explains PWA installation on iPhone and Android, optional notifications, and clear next steps — before or after login.

## Route added

| Path | Auth |
|------|------|
| `/{locale}/install` | **None** — public page |

Files:

- `src/app/[locale]/install/page.tsx`
- `src/features/pwa/components/install-education-page.tsx`

## UX behavior

- Dark cosmic Mystic layout (brand header, numbered steps, platform card)
- Reuses `usePwaInstallState` — no duplicated browser detection
- No notification permission request on page load
- Honest states only (no fake install success)

## Android behavior

- When `beforeinstallprompt` is available: primary **Install Mystic** button calls `promptInstall()`
- Shows accepted/dismissed feedback after user choice
- When Android but no prompt yet: instructions only (no fake button)

## iPhone behavior

- Shows Share → Add to Home Screen instructions
- **No fake install button** on iOS

## Already installed

- Shows: *Mystic is already installed on this device.*

## Unsupported browser

- Shows honest guidance to open in Safari (iPhone) or Chrome (Android)

## Navigation CTAs

| Auth state | Primary CTA | Secondary |
|------------|-------------|-----------|
| Signed out | Continue to Login → `/{locale}/login` | Back to home |
| Signed in | Enter Mystic → `/{locale}/today` | Open Profile → `/{locale}/profile` |

## Entry point links

| Surface | Component | Link |
|---------|-----------|------|
| Login / register | `InstallPagePromo` in `auth-screen.tsx` | `/{locale}/install` |
| Onboarding finish | `onboarding-flow.tsx` | `/{locale}/install` |
| Profile → Notifications | `notification-settings-panel.tsx` | `/{locale}/install` |

Existing inline `InstallMysticCard` remains on Profile notifications panel.

## i18n

- **RU:** full polished copy under `pwa.installPage`
- **EN:** full copy under `pwa.installPage`
- **DE:** English fallback (no machine translation)
- Login promo: `auth.installPromo`
- Profile link: `notifications.installEducationLink`
- Onboarding: `auth.onboarding.compact.installLink`

## Tests added

`src/features/pwa/tests/phase-26a-install-education-page.test.ts` (15 tests)

## Manual QA

Run `npm run dev` and check mobile viewport (390–430px):

- `/ru/install`, `/en/install` — premium layout, clear copy
- `/ru/login` — subtle install promo card
- `/ru/profile` → Notifications — install education link

## Known gaps

- No deep link from Today screen (by design this phase)
- Desktop users see unsupported-browser guidance (expected)
- PWA install prompt only appears in production HTTPS / eligible Android Chrome

**Phase 26B** adds why-install and removal instructions: [phase-26b-install-benefits-uninstall-instructions.md](./phase-26b-install-benefits-uninstall-instructions.md)

## Safety

- No commit / push / deploy in this phase
- `.env.local` untouched
- Flutter untouched
