# Phase 12E — Subscription / Paywall placeholder parity

## Flutter premium files inspected (read-only)

| File | Purpose |
|------|---------|
| `lib/services/premium_access_service.dart` | Single source of truth for premium UI |
| `lib/services/premium_service.dart` | RevenueCat store entitlement |
| `lib/features/premium/premium_paywall_screen.dart` | Paywall UI (not ported) |
| `lib/services/daily_guidance/premium_daily_guidance_composer.dart` | Premium depth layers |

**Not modified.** Web prepares honest placeholders for Phase 15 PayPal.

## Web premium files inspected / created

| Path | Role |
|------|------|
| `src/features/premium/constants.ts` | `WEB_MYSTIC_PLUS_PAYMENT_WIRED`, `COURSE_PURCHASE_FLOW_WIRED` |
| `src/features/premium/utils/resolve-premium-display-status.ts` | `free` / `premium` / `owner` / `devOverride` |
| `src/features/premium/components/mystic-plus-lock-card.tsx` | Shared lock card |
| `src/features/profile/utils/premium-access.ts` | Existing `resolvePremiumAccess` (unchanged logic) |
| `src/features/profile/components/profile-subscription-section.tsx` | Profile Mystic Plus section |

## Entitlement behavior

- **Source of truth:** Firestore profile fields (`isPremium`, `premiumOverride`, `isOwner`)
- **Display:** `resolvePremiumDisplayStatus()` — no client-only unlock, no localStorage
- **Access:** `hasPremiumEntitlement()` delegates to existing `resolvePremiumAccess()`
- Owner/dev override show **Active** with honest variant notes

## Profile Mystic Plus behavior

- Status: Free / Active
- Positioning copy from `premium` namespace
- Web: “Mystic Plus will open soon on the web version”
- Disabled button: “Payment setup coming later”
- No manage subscription, restore, or checkout

## Premium lock card behavior

Shared `MysticPlusLockCard` on Today, Moon, Rune detail (via re-exports).

- Title: Mystic Plus
- Body: unlock when Plus opens on web
- Disabled payment button + Profile link
- Today adds subtle `todayDepthNote` above the card

## Course purchase placeholder

- Paid courses: “available for purchase soon” + separate from Mystic Plus
- Premium-gated courses: Mystic Plus lock copy (not purchase copy)
- `COURSE_PURCHASE_FLOW_WIRED = false` — unchanged access logic

## Intentionally unavailable

- PayPal / checkout
- Restore purchases
- Manage subscription
- Fake trial / fake success states
- Scheduled notification cron (Phase 12C)

## Phase 15 PayPal must implement

- Payment provider integration
- Server-verified entitlements
- Purchase / restore flows
- Manage subscription where applicable

## Tests added

`src/features/premium/tests/phase-12e-subscription-paywall-placeholder.test.ts`

Updated: `today-parity`, `moon-rune-ui-parity`, `phase-12d-profile-settings-parity`

## Validation results

```text
assets:check — passed
lint         — passed (1 pre-existing PWA warning)
test         — 509 passed (41 files)
build        — passed
verify:firebase — passed
```

## Remaining gaps

- No web payment provider
- Legal pages (Phase 12F)
- Flutter RevenueCat / restore not mirrored on web

## Safe for Phase 12F?

**Yes** — subscription placeholders are coherent; legal/trust pages can proceed.

## Not modified

Flutter, `.env.local`, Firebase config, deterministic engines.
