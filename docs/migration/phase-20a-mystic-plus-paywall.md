# Phase 20A — Mystic Plus paywall page + Profile link

Polished Mystic Plus paywall at `/{locale}/plus` with consistent entry points from Profile and locked premium surfaces. Payment remains honestly deferred — no fake unlock.

## Flutter files inspected (read-only)

| Area | Path |
|------|------|
| Paywall screen | `lib/features/premium/premium_paywall_screen.dart` |
| Premium access | `lib/services/premium_access_service.dart` |
| Today lock CTAs | `lib/features/daily_guidance/daily_guidance_panel.dart` |
| Profile Mystic Plus | `lib/features/profile/profile_screen.dart` |
| Strings | `lib/core/i18n/strings.dart` (`paywall_*`, `profile_mystic_plus_*`, `guidance_moon_premium_cta`) |
| Moon / library locks | `lib/features/moon/moon_phase_screen.dart`, `lib/features/library/library_detail_screen.dart` |

## Web files changed

| File | Change |
|------|--------|
| `src/app/[locale]/plus/page.tsx` | **New** paywall route |
| `src/app/[locale]/mystic-plus/page.tsx` | **New** alias redirect → `/plus` |
| `src/features/premium/components/mystic-plus-paywall-screen.tsx` | **New** paywall UI |
| `src/features/premium/components/mystic-plus-paywall-link.tsx` | **New** shared CTA link to `/plus` |
| `src/features/premium/components/mystic-plus-lock-card.tsx` | Routes to paywall |
| `src/features/today/components/today-mystic-plus-panel.tsx` | Routes to paywall |
| `src/features/profile/components/profile-subscription-section.tsx` | Links to paywall |
| `src/features/premium/utils/resolve-premium-display-status.ts` | `resolvePremiumActiveNoteKey()` helper |
| `src/config/navigation.ts` | Bottom nav visible on `/plus` (no new tab) |
| `src/styles/mystic-theme.css` | Paywall panel styles |
| `src/messages/en.json`, `ru.json`, `de.json` | `premium.paywall.*`, `profile.subscription.openPlus` |
| `src/features/premium/tests/phase-20a-mystic-plus-paywall.test.ts` | **New** |
| Prior premium/profile/QA tests | Updated for paywall routing |

## Paywall route

- **Primary:** `/{locale}/plus`
- **Alias:** `/{locale}/mystic-plus` → redirects to `/plus`

## Benefits / copy

EN/RU calm premium copy under `premium.paywall`:

- Hero: Unlock the full reading / Откройте полный разбор
- Benefits: daily reading, moon, rune, numerology, reminders
- Disclaimer: reflective practice, not medical/legal/financial/psychological advice
- Course separation note on paywall

`de.json` uses English structural fallback for paywall keys (no machine German).

## Payment behavior

- `WEB_MYSTIC_PLUS_PAYMENT_WIRED = false` (unchanged)
- Paywall shows **disabled** CTA: `Payment setup coming soon` / `Оплата скоро будет доступна`
- No checkout creation, no client-side entitlement grant
- Shopify checkout remains course-only (`/api/shopify/checkout/create`)

## Access state behavior

Uses existing `resolvePremiumAccess` / `hasPremiumEntitlement` / `resolvePremiumDisplayStatus`:

| State | User-facing label |
|-------|-------------------|
| Free | Mystic Plus not active |
| Premium / owner / dev override | You have Mystic Plus / Mystic Plus активен |

Raw flags (`premiumOverride`, `isOwner`) are not shown in UI.

## Profile / Settings link

`ProfileSubscriptionSection`:

- EN: Mystic Plus — Unlock deeper daily guidance → `/plus`
- RU: Mystic Plus — Откройте более глубокую ежедневную подсказку → `/plus`
- Active users see “You have Mystic Plus” CTA (links to paywall status view)

## Locked CTA links

| Surface | CTA |
|---------|-----|
| Today `TodayMysticPlusPanel` | Unlock full reading → `/plus` |
| Moon / Rune `MysticPlusLockCard` | Unlock full reading + Open in Mystic Plus → `/plus` |

## Tests added

`phase-20a-mystic-plus-paywall.test.ts` — route, copy, payment honesty, access states, Profile link, locked CTAs, course separation, shell behavior.

**941/941** tests pass.

## Manual QA

Dev server `http://localhost:3001`:

| Route | Result |
|-------|--------|
| `/en/plus` | 200 — hero, disclaimer, disabled payment CTA |
| `/ru/plus` | 200 |
| `/en/mystic-plus` | 307 → `/en/plus` |

Locked surfaces and Profile link to `/plus` (verify signed-in on device at 390–430px).

## Known gaps

- Mystic Plus subscription checkout not wired on web
- No restore-purchases flow (Flutter has RevenueCat restore)
- Paywall accessible without sign-in (shows anonymous “not active” state; Profile requires auth)
- Price placeholder only (`Coming soon on web`) — no fake € pricing

## Safety confirmations

- No commit, push, or deploy
- `.env.local` untouched
- Flutter untouched
- No secrets printed
- Today visual work preserved
