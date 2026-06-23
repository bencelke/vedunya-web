# Phase 9.4 — Brand / logo consistency

## Issue observed

After Phase 9.3 fixed the Today daily-guidance wordmark, several surfaces still showed inconsistent branding:

- **Auth brand header** hardcoded `Mystic` in the letter-spaced wordmark (`mystic-auth-wordmark`), rendering as **MYSTIC** via CSS uppercase.
- **Onboarding welcome step** showed only the Makosh emblem with no **Vedunya Maria** wordmark.
- **App header** duplicated mark + text inline instead of reusing the shared `BrandMark` component (vedunya-mark.svg + Vedunya Maria).

PWA metadata, Mystic Plus copy, install/reminder strings, and internal component names were already correct and intentionally left unchanged.

## Brand usages found (grep audit)

| Category | Examples | Action |
|----------|----------|--------|
| User-facing headers | `daily-guidance-header`, `app-header`, `auth-brand-header` | Fixed auth + app header; Today already fixed in 9.3 |
| Auth / onboarding | `auth-screen`, `onboarding-flow`, `MysticLogo` | Fixed wordmark copy; kept Makosh emblem |
| PWA metadata | `app-config`, `pwa.ts`, `manifest.ts` | Kept `Mystic by Vedunya Maria` / short `Mystic` |
| Legal / product copy | `welcomeHeadline`, `legalNotice`, Mystic Plus locks | Kept Mystic product naming |
| Internal names | `MysticLogo`, `MYSTIC_CACHE_PREFIX`, `MysticRuneSigil` | No change |
| Docs / tests | Phase 9.3/9.4 tests, auth/onboarding parity | Updated + added |

## Files modified

- `src/messages/en.json` — added `auth.brandWordmark`
- `src/messages/ru.json` — added `auth.brandWordmark`
- `src/features/auth/components/auth-brand-header.tsx` — client component; i18n wordmark; Makosh emblem only
- `src/features/onboarding/components/onboarding-flow.tsx` — Vedunya Maria wordmark on welcome step
- `src/components/layout/app-header.tsx` — uses `BrandMark` with `vedunya-mark.svg`
- `src/features/auth/tests/auth-ui-parity.test.ts` — brand wordmark assertions
- `src/features/onboarding/tests/onboarding-parity.test.ts` — onboarding wordmark assertion
- `src/features/brand/tests/phase-9-4-brand-logo-consistency.test.ts` — new focused tests
- `docs/migration/phase-9-4-brand-logo-consistency.md` — this document

## Changed to Vedunya Maria

- Auth letter-spaced header wordmark: **Vedunya Maria** (renders as VEDUNYA MARIA via CSS)
- Onboarding welcome step header: **Vedunya Maria**
- App chrome header: **Vedunya Maria** via `BrandMark` (unchanged text, consolidated component)
- Today header: already **Vedunya Maria** from Phase 9.3 (`dailyGuidance.brandWordmark`)

## Intentionally stayed Mystic

| Surface | Value | Why |
|---------|-------|-----|
| PWA `name` | Mystic by Vedunya Maria | Full product / legal name |
| PWA `short_name` | Mystic | Install icon label |
| Install / reminder copy | Install Mystic… | Product short name on device |
| Auth headlines | Welcome to Mystic by Vedunya Maria | Full product wording |
| Mystic Plus gating | Mystic Plus | Subscription product label |
| Push test title | Mystic | Notification product name |
| Internal components | MysticLogo, MysticRuneSigil, etc. | Code identifiers, not user headers |

## Login / onboarding result

- **Login / register / forgot-password**: Makosh emblem + **Vedunya Maria** wordmark + headline “Welcome to Mystic by Vedunya Maria” (or sign-in specific titles).
- **Onboarding step 0**: **Vedunya Maria** wordmark above Makosh emblem; step cards unchanged.

## Small header icon decision

`app-header` now uses `BrandMark` with `showLogo` and `public/assets/brand/vedunya-mark.svg` (20×20 compact). This replaces the previous `icon-makosh-padded.png` inline usage. The mark is clean and pairs with **Vedunya Maria** text. No new assets were generated.

## Tests added / updated

- **New:** `src/features/brand/tests/phase-9-4-brand-logo-consistency.test.ts`
  - Today / app header Vedunya Maria
  - Auth + onboarding wordmark via i18n
  - PWA naming unchanged
  - Makosh + vedunya-mark asset pairing
  - EN/RU route wiring
- **Updated:** `auth-ui-parity.test.ts`, `onboarding-parity.test.ts`

## Remaining logo polish (non-blocking)

- Optional: unify `dailyGuidance.brandWordmark` and `auth.brandWordmark` under a single `common.brandWordmark` key.
- Optional: light-variant Makosh on very dark auth backgrounds if contrast review suggests it.
- Landing page brand pass if/when marketing shell is expanded.

## Safe to continue Phase 10?

**Yes.** User-facing primary headers are consistent with **Vedunya Maria**; product/PWA contexts correctly retain **Mystic**. No auth, Firebase, PWA logic, or deterministic engine changes were made.

## Constraints honored

- Flutter (`mystic_app`) not modified
- `.env.local` not touched
- No commits / pushes in this phase
