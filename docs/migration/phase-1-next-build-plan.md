# Phase 1 — Next Build Plan

Based on Flutter audit at `b39cad1` and web state at `3e12994`.

---

## Phase 2 — Brand/theme foundation ✅

**Status:** Completed — see `docs/migration/phase-2-brand-theme-foundation.md`.

**Goal:** Single source of truth for Flutter dual-theme (light auth + dark cosmic).

Implemented:

```text
src/styles/mystic-theme.css
src/config/mysticTheme.ts
src/config/mysticAssets.ts
src/config/theme.ts                    — legacy facade
src/components/ui/Mystic*.tsx          — shared primitive entry points
src/components/ui/button.tsx           — pill radius token
src/components/ui/card.tsx             — cosmic glass tone
src/components/layout/app-shell.tsx      — starfield + centered canvas
src/components/layout/bottom-navigation.tsx — chrome glass nav
src/components/brand/mystic-logo.tsx
```

**Do not implement in Phase 1.**

---

## Phase 3 — Auth parity ✅

**Status:** Completed — see `docs/migration/phase-3-auth-ui-parity.md`.

- Combined `/login` with register toggle + branded light auth shell
- Underline inputs, wordmark header, Flutter-style locale toggle
- Google sign-in preserved; Apple disabled with clear copy
- Forgot password at `/forgot-password`
- EN/RU copy polished

---

## Phase 4 — Onboarding parity ✅

**Status:** Completed — see `docs/migration/phase-4-onboarding-parity.md`.

- 5-step flow: Welcome → Name → DOB → Language → Ready
- Flutter-style progress dots, light shell, underline name input
- DOB date-only validation preserved; merge-safe Firestore writes
- No fake AI preview step

---

## Phase 5 — Today parity ✅

**Status:** Completed — see `docs/migration/phase-5-today-parity.md`.

- Flutter hierarchy: primary → large rune hero → rhythm → premium-gated depth
- `resolvePremiumAccess` gates reflection, rune deep, moon deep
- `mystic-today-column` (420px) cosmic layout
- Mystic Plus lock card for free users

---

## Phase 6 — Moon/Rune polish ✅

**Status:** Completed — see `docs/migration/phase-6-moon-rune-polish.md`.

- Moon 200px phase hero, cosmic cards, premium gating + lock card
- Rune detail large sigil, gated deep fields, alias redirect preserved
- `resolvePremiumAccess` at load layer for Moon and Rune

---

## Phase 7 — Courses/Library ✅

**Status:** Completed — see `docs/migration/phase-7-courses-library-parity.md`.

- Mystic cosmic catalog, detail, lesson reader shells
- Living the Runes from local fallback (28 lessons)
- Honest coming soon locked state; no fake checkout
- Progress/resume preserved on existing Firestore contract

- Lesson count / title consistency (24 vs 28)
- Library card glass styling

Files: `course-catalog.tsx`, `course-card.tsx`, `course-detail-hero.tsx`, `lesson-reader.tsx`

---

## Phase 8 — PWA install ✅

**Status:** Completed — see `docs/migration/phase-8-pwa-install-foundation.md`.

- `src/app/manifest.ts` with PNG icons from Flutter launcher assets
- Service worker offline shell + `/en/offline`, `/ru/offline`
- Profile install section (Android prompt + iPhone guide)
- Update banner via `PwaRegistrar`

---

## Phase 9 — Web Push

**Status: complete (Phase 9, 2026-06-23)**

- Standards-based Web Push + VAPID (not FCM/OneSignal)
- Profile reminder settings UI with opt-in permission flow
- Firestore `pushSubscriptions` + `notificationPreferences`
- Service worker push/click handlers in `public/sw.js`
- Manual test notification via `/api/push/test`
- Scheduled reminders documented in `docs/setup/web-push-scheduled-reminders.md` (not deployed)

---

## Phase 10 — Admin

- Custom claims gate (not UI-only)
- Admin hub subset (content, not bot ops unless needed)

---

## Phase 11 — PayPal

- Replace RevenueCat paywall with web entitlements
- `premium_paywall_screen.dart` visual reference only
- Server-side entitlement writes

---

## Phase 12 — Text parity and Request the Universe

**Phase 12A — complete:** Full Mystic text parity (`docs/migration/phase-12a-full-mystic-text-parity.md`)

**Phase 12B — complete:** Request the Universe as top Today feature (`docs/migration/phase-12b-request-the-universe.md`)

---

## Phase 12 (deployment) — Vercel deployment

- Production env, domains, `app.vedunya.com`
- Firebase authorized domains
- Smoke tests

---

## Phase 13 — Final QA

- Parity test cases from `parity-test-cases.md`
- EN/RU responsive QA (320–768px + desktop)
- Live Firebase auth checklist
- No Feed/Cards unless product scope changes

---

## Immediate next action

**Phase 2 — Brand/theme foundation using the real Flutter audit.**

Do not start Phase 2 in Phase 1 documentation work.
