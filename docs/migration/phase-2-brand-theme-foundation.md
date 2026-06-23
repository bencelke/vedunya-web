# Phase 2 — Brand / Theme Foundation

Centralized Mystic web design tokens mapped from Flutter `AppColors`, `CosmicTokens`, and `MysticChromeTokens`. Phase 2 establishes the foundation only — no full screen rewrites.

---

## Flutter theme files inspected

| File | Role |
|------|------|
| `lib/theme/app_colors.dart` | Light auth/onboarding palette |
| `lib/theme/cosmic_tokens.dart` | Dark cosmic app palette + background asset |
| `lib/theme/mystic_chrome_tokens.dart` | Glass nav, gold active, muted icons |
| `lib/theme/mystic_decorations.dart` | `MysticRadii` (sm/md/lg/xl/pill) |
| `lib/theme/mystic_spacing.dart` | Vertical rhythm, screen padding |
| `lib/theme/today_editorial.dart` | Today content max width 420px |

---

## Web files created / modified

### Created

| Path | Purpose |
|------|---------|
| `src/styles/mystic-theme.css` | CSS variables + layout/effect utilities |
| `src/config/mysticTheme.ts` | Token names, Flutter refs, typography, layout classes |
| `src/config/mysticAssets.ts` | Public asset path constants |
| `src/components/ui/MysticButton.tsx` | Re-export of shared `Button` |
| `src/components/ui/MysticCard.tsx` | Card with `app` / `auth` / `cosmic` / `elevated` tones |
| `src/components/ui/MysticInput.tsx` | Re-export of shared `Input` |
| `src/components/ui/MysticShell.tsx` | Re-export `AuthShell`, `OnboardingShell`, `AppShell` |
| `src/components/ui/MysticLogo.tsx` | Re-export brand logo |
| `src/components/ui/MysticBottomNav.tsx` | Re-export bottom navigation |
| `src/config/mystic-theme-foundation.test.ts` | Theme + asset + primitive tests |

### Modified (light-touch)

| Path | Change |
|------|--------|
| `src/config/theme.ts` | Facade over `mysticTheme` + legacy flat `assets` / `app` / `auth` |
| `src/app/globals.css` | Removed duplicate `:root` tokens; base layer + safe-area utilities |
| `src/components/ui/button.tsx` | Pill radius via `--radius-pill` |
| `src/components/ui/card.tsx` | `tone` prop + cosmic glass variants |
| `src/components/ui/auth-shell.tsx` | (unchanged structure; uses mystic auth classes) |
| `src/components/layout/app-shell.tsx` | `mystic-app-canvas` centered desktop column |
| `src/components/layout/bottom-navigation.tsx` | `mystic-chrome-nav` glass tokens |
| `src/components/layout/app-header.tsx` | `mystic-chrome-header` + `mysticAssets` |
| `src/components/brand/mystic-logo.tsx` | Uses `mysticAssets` |

---

## Token mapping table

| Web CSS variable | Flutter source | Value / decision |
|------------------|----------------|------------------|
| `--mystic-gold` | `CosmicTokens.goldGlow` | `#C4A86A` |
| `--mystic-gold-soft` | `CosmicTokens.goldGlow` @ 16% | `rgba(196, 168, 106, 0.16)` |
| `--mystic-gold-deep` | Derived | `#9A8558` (darker gold for depth) |
| `--mystic-void` | `CosmicTokens.voidDeep` | `#0B0D14` |
| `--mystic-parchment` | `CosmicTokens.parchment` | `#F3EDE3` |
| `--mystic-ivory` | `AppColors.surfaceIvory` | `#F8F6F0` |
| `--mystic-ink` | `AppColors.textPrimary` | `#000000` |
| `--auth-bg` | `AppColors.background` | `#FFFFFF` |
| `--auth-card` | `AppColors.background` | `#FFFFFF` |
| `--auth-text` | `AppColors.textPrimary` | `#000000` |
| `--auth-muted` | `AppColors.textSecondary` | `#444444` |
| `--auth-border` | `AppColors.border` | `#E5E5E5` |
| `--auth-gold` | `AppColors.mutedGold` | `#B89B5E` |
| `--app-bg` | `CosmicTokens.voidDeep` | `#0B0D14` |
| `--app-surface` | `CosmicTokens.surface` | `#12182A` |
| `--app-surface-elevated` | `CosmicTokens.surfaceElevated` | `#1A2238` |
| `--app-text` | `CosmicTokens.textGoldHero` | `#FAF6EC` |
| `--app-muted` | `CosmicTokens.parchment` | `#F3EDE3` |
| `--app-border` | `MysticChromeTokens.dividerSoft` | `rgba(196, 168, 106, 0.2)` |
| `--app-glass` | `CosmicTokens.surfaceGlass` | `rgba(18, 24, 34, 0.88)` |
| `--chrome-glass` | `MysticChromeTokens.surfaceGlass` | `rgba(12, 16, 24, 0.784)` (`0xC80C1018`) |
| `--chrome-blur` | `MysticChromeTokens` blur sigma | `20px` |
| `--nav-active` | `MysticChromeTokens.gold` | `#C4A86A` |
| `--nav-inactive` | `MysticChromeTokens.iconMuted` | `#6B6458` |
| `--radius-sm` … `--radius-pill` | `MysticRadii` | 12 / 16 / 20 / 24 / 9999px |
| `--content-max-width` | Shell column | `32rem` (512px) |
| `--today-max-width` | `MysticSpacingToday.contentMaxWidth` | `26.25rem` (420px) |
| `--content-mobile-padding` | `MysticSpacing` horizontal | `1.25rem` (20px; Flutter uses 32px wide screens — web uses mobile-first 20px, scales in shell) |
| `--shadow-card` | `MysticDecorations` cosmic cards | Deep lift shadow |
| `--glow-gold` | Cosmic hero glow | Radial gold gradient |

Legacy aliases (`--page-bg`, `--accent-gold`, `--auth-page-bg`, etc.) remain in `mystic-theme.css` so existing Tailwind utility classes keep working.

---

## Light auth theme decisions

- Pure white `#FFFFFF` page + card (Flutter `AppColors.background`).
- Gold accent `#B89B5E` for CTAs and progress (Flutter `mutedGold`, not cosmic glow gold).
- Subtle radial gold wash via `--auth-glow` (web equivalent of light hero atmosphere).
- Auth shells use `mystic-auth-page` + `mystic-auth-card` utilities.

---

## Dark app theme decisions

- Void background `#0B0D14` with starfield JPEG overlay at 34% opacity (`app-background.jpg`).
- Cosmic glass cards via `mystic-cosmic-card` (blur + `--app-glass`).
- Text hierarchy: hero `#FAF6EC`, labels `#C4B090`, whispers `#A89878`.
- Desktop: full-bleed background, content in `mystic-app-canvas` (max 512px).

---

## Chrome / nav decisions

- Bottom nav: `mystic-chrome-nav` with `--chrome-glass` + `backdrop-filter: blur(20px)`.
- Active tab: gold pill indicator + icon glow matching Flutter `goldGlow`.
- Inactive: `#6B6458` from `MysticChromeTokens.iconMuted`.
- Header: `mystic-chrome-header` with matching border + blur.

---

## Asset helper decisions

`src/config/mysticAssets.ts` groups paths under `brand`, `backgrounds`, `moon`, `runes`, `courses`. `src/config/theme.ts` exposes flat legacy keys (`mysticLogo`, `appBackground`, etc.) for existing consumers.

Verified paths:

- `public/assets/brand/mystic-logo.svg`
- `public/assets/brand/mystic-logo-white.svg`
- `public/assets/brand/icon-makosh-padded.png`
- `public/assets/brand/google-g.svg`
- `public/assets/backgrounds/app-background.jpg`
- `public/assets/moon/phases/*`
- `public/assets/runes/symbols/*`

---

## Components created / refined

| Component | Status |
|-----------|--------|
| `MysticButton` | Re-export; pill radius token |
| `MysticCard` | New tones: app, auth, cosmic, elevated |
| `MysticInput` | Re-export; existing `app` / `auth` tones |
| `MysticShell` | Re-export auth + app shells |
| `MysticLogo` | Re-export; `mysticAssets` paths |
| `MysticBottomNav` | Re-export; chrome glass styling |
| `Button`, `Card`, `Input` | Refined in place (not duplicated) |

---

## Intentionally not changed

- Auth / onboarding screen flows and Firebase logic
- Today, Moon, Rune deterministic engines
- Firestore contracts and profile bootstrap
- Feed, Insights, Admin tabs (still excluded from V1 nav)
- Paywall gates, PWA, payments
- Full screen layout rewrites
- Font files (Geist remains)
- `.env.local`, Flutter source

---

## Remaining screen-specific work (Phase 3+)

| Phase | Focus |
|-------|-------|
| **Phase 3** | Auth/login/register/forgot-password UI parity using theme foundation |
| Phase 4 | Onboarding preview + step parity |
| Phase 5 | Today hero scale, cinematic nav, premium gate placeholders |
| Phase 6 | Moon/Rune visual polish |
| Phase 7 | Courses purchase wiring |

---

## Validation

Run after changes:

```bash
npm run assets:check
npm run lint
npm test
npm run build
```

Optional (when Firebase configured):

```bash
npm run verify:firebase
npm run content:check
```
