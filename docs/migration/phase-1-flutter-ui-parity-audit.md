# Phase 1 — Flutter UI Parity Audit

Date: 2026-06-23  
Flutter source: `/Users/boris/Documents/mystic_app`  
Flutter commit: `b39cad1` — *Mystic V2: live Firestore feed, post creation working, index fix, feed ordering improved, admin delete groundwork*  
Web project: `/Users/boris/Documents/vedunya-web`  
Web commit: `3e12994` — *Add production asset migration from Mystic Flutter*  
Flutter modified: **no**  
Web product code modified in Phase 1: **no**

---

## Executive summary

The live Flutter app at `b39cad1` uses a **dual visual system**:

1. **Light premium** — splash, onboarding, welcome auth, login/register (`AppColors`: white `#FFFFFF`, gold `#B89B5E`, black text).
2. **Dark cosmic** — main shell tabs, profile, paywall (`CosmicTokens`: void `#0B0D14`, gold glow `#C4A86A`, parchment text, starfield JPG background).

The production mobile shell (`HomeShell`) exposes **five bottom tabs**: Today, Insights, Moon, Library, **Feed**. Profile is **pushed**, not tabbed. Admin is profile-gated.

**Vedunya Web V1 scope** intentionally maps to a **four-tab shell** (Today, Moon, Courses, Profile) and excludes Feed, Insights tab, and Admin. This is a product decision, not an audit omission.

---

## Active production navigation (Flutter `b39cad1`)

**Entry:** `main.dart` → `AuthGate` → `App` → `MobileAppRoot` → `HomeShell`

### Auth gate flow

```
LaunchSplashScreen (1.5s)
  → Firebase authStateChanges
  → [unsigned + !onboarding] OnboardingFlow (account choice)
  → [unsigned + onboarding done] WelcomeAuthScreen
  → [signed + incomplete profile] ProfileSetupScreen
  → [signed + complete] App → HomeShell
```

### Bottom navigation (`mystic_bottom_nav.dart`)

| Index | Label key | Screen | V1 web target |
|-------|-----------|--------|---------------|
| 0 | `nav_today` | `OracleScreen` | `/today` ✓ |
| 1 | `nav_insights` | `InsightsTabScreen` | **deferred** |
| 2 | `nav_moon` | `MoonPhaseScreen` | `/moon` ✓ |
| 3 | `nav_library` | `LibraryScreen` | `/courses` ✓ |
| 4 | `nav_feed` | `SocialFeedPage` | **excluded** |

**Nav chrome:** dark glass (`surfaceGlass` `0xC80C1018`), blur, gold active (`goldGlow` `0xFFC4A86A`), 20px top radius, SafeArea bottom padding.

**Profile:** `ProfileAvatarButton` in tab headers → pushed `ProfileScreen`. Web uses bottom-nav Profile tab instead.

**Admin:** `ProfileScreen` → `AdminControlHubScreen` when `AdminAccessService` allows. Web deferred.

---

## Deprecated / hidden / experimental (Flutter)

| Item | File | Status |
|------|------|--------|
| Legacy 4-tab `AppShell` | `lib/app/app_shell.dart` | Unwired |
| Legacy web shell | `lib/app/web_app_shell.dart` | Unwired |
| Card of the Day page | `lib/features/today/card_of_the_day_page.dart` | Legacy |
| Old Today/Numerology pages | `today_page.dart`, etc. | Unwired |
| `HomePage` router stub | `lib/features/home/home_page.dart` | Not live `home:` |

Feed is **active in Flutter V2** but **out of web V1 scope**.

---

## Screen-by-screen audit

### Auth (`welcome_auth_screen.dart`, `login_screen.dart`, `register_screen.dart`)

| Aspect | Flutter |
|--------|---------|
| Background | White `#FFFFFF` scaffold |
| Logo | `MysticLogo` centered, `MysticBrandTitle` |
| CTAs | Register primary gold pill; login outlined; Google/Apple on welcome |
| Inputs | `mysticAuthInputDecoration`, ivory surfaces |
| Locale | `AuthLocalizations`, EN/RU toggle on welcome |
| Flow | Welcome → push Login/Register routes |
| Forgot password | **Not in Flutter production** |

**Web gap:** Combined login/register screen; Apple placeholder; web adds forgot-password. Light auth shell partially implemented (uncommitted).

### Onboarding (`onboarding_flow.dart`)

| Aspect | Flutter |
|--------|---------|
| Steps | 5: Welcome → Name → DOB → Preview → Account/Enter |
| Style | Light theme, progress dots, `PageView` |
| Preview | `DailyGuidanceLoader.loadOnboardingPreview` on step 4 |
| Account | Login/register on final step when `showAccountChoice: true` |
| Fields | Name, DOB, locale; Firestore via `finalizeOnboardingSession` |

**Web gap:** Post-auth only; no guidance preview step; no account-creation step in flow.

### Today / Oracle (`oracle_screen.dart`, `daily_guidance_panel.dart`)

| Aspect | Flutter |
|--------|---------|
| Style | Dark cosmic, `MysticCinematicTopNav`, starfield background |
| Hierarchy | Hero greeting → combined guidance headline → **large rune sigil (272px)** → numerology → moon hero → action (premium-gated) → reflection (premium) → Ask Mystic CTA |
| Premium | Locks rune depth, moon deep copy, action/reflection for free users |
| Motion | Staggered `editorialReveal` delays |
| Max width | ~420px, 28px gutter |

**Web gap:** Message-first hierarchy (documented web choice); no premium gates; no Ask Mystic; no cinematic top nav; Insights deep content on separate Flutter tab.

### Insights (tab 1)

| Aspect | Flutter |
|--------|---------|
| File | `deeper_guidance_placeholder_screen.dart` (live UI despite name) |
| Content | Firestore rune insights sections, deeper editorial |

**Web:** No route. Rune detail at `/runes/[id]` partially covers deep content.

### Moon (`moon_phase_screen.dart`)

| Aspect | Flutter |
|--------|---------|
| Hero | `MoonPhaseHero` 224px cinematic |
| Sections | Phase title, meaning, lunar timing sheet, lunar day, facts, location accuracy |
| Premium | Extended fields gated via `MysticGoldPillButton` → paywall |

**Web gap:** Core phase + lunar day implemented; no premium gates; no manual location screen.

### Rune

| Aspect | Flutter |
|--------|---------|
| Today | Large sigil in `daily_guidance_panel.dart` |
| Insights | Firestore deep sections |
| Detail | Lesson/insights readers |

**Web:** Summary card + `/runes/[runeId]` detail; symbol 72px vs Flutter 272px hero.

### Library / Courses (`library_screen.dart`)

| Aspect | Flutter |
|--------|---------|
| Data | Sanity GROQ + local fallback |
| UI | Dark glass cards, gold accent, pull-to-refresh |
| Living the Runes | 28 lessons local Dart, IAP lock states |
| Detail | `LibraryDetailScreen` → lesson reader |

**Web gap:** Purchase flow unwired; catalog thin without Sanity; 24 vs 28 lesson marketing mismatch.

### Profile (`profile_screen.dart`)

| Aspect | Flutter |
|--------|---------|
| Style | Dark cosmic panels on starfield |
| Sections | Hero, account, admin (gated), Mystic Plus, journey, preferences, about |
| Settings | Language, notifications as sub-screens |

**Web gap:** Basic CRUD only; subscription placeholder; no notification settings screen; profile is bottom-nav tab.

### Paywall (`premium_paywall_screen.dart`)

| Aspect | Flutter |
|--------|---------|
| Style | Dark cosmic, benefit rows, RevenueCat monthly package |
| Web | **Deferred** to PayPal phase — do not implement RevenueCat on web |

---

## Design system findings

### Light auth palette (`lib/theme/app_colors.dart`)

| Token | Hex |
|-------|-----|
| background | `#FFFFFF` |
| textPrimary | `#000000` |
| mutedGold | `#B89B5E` |
| surfaceIvory | `#F8F6F0` |
| surfaceCream | `#F5F1E8` |
| border | `#E5E5E5` |

### Dark cosmic palette (`lib/theme/cosmic_tokens.dart`)

| Token | Hex |
|-------|-----|
| voidDeep | `#0B0D14` |
| goldGlow | `#C4A86A` |
| parchment | `#F3EDE3` |
| textGoldHero | `#FAF6EC` |

### Chrome (`lib/theme/mystic_chrome_tokens.dart`)

| Token | Value |
|-------|-------|
| surfaceGlass | `0xC80C1018` |
| iconMuted | `#6B6458` |
| wordmarkGold | `#E2D4B8` |

### Shared patterns

- Pill buttons (~46px height, radius 999)
- Card radius ~16–20px on cosmic panels
- `MysticBackground` JPEG + overlay 0.34 opacity
- Bottom nav blur sigma 20
- SafeArea on nav and scroll content

---

## Asset findings (production → web)

| Flutter path | Web path | Status |
|--------------|----------|--------|
| `assets/logo/mystic_logo.svg` | `public/assets/brand/mystic-logo.svg` | migrated |
| `assets/logo/logo-white-svg.svg` | `public/assets/brand/mystic-logo-white.svg` | migrated |
| `assets/logo/icon-makosh-padded.png` | `public/assets/brand/icon-makosh-padded.png` | migrated |
| `assets/logo/google_g.svg` | `public/assets/brand/google-g.svg` | migrated |
| `assets/background/background-jpg.jpg` | `public/assets/backgrounds/app-background.jpg` | migrated |
| `assets/moon/svg_moon/moon_*.png` (7) | `public/assets/moon/phases/moon_*.png` | migrated |
| `assets/runes/svg/{canonical}.svg` (24) | `public/assets/runes/symbols/*.svg` | migrated |
| `assets/Course Visuals/.../prozhivanie.png` | `public/assets/courses/living-the-runes/prozhivanie.png` | migrated |
| `assets/logo/splash-screen.png` | `public/assets/brand/splash-screen.png` | migrated, unused on web |
| `assets/fonts/Noto_Sans_Runic/` | — | **not copied** (use web font later) |
| `assets/cards/` (70 files) | — | **excluded** (not V1) |

---

## Risk notes

| Risk | Severity | Detail |
|------|----------|--------|
| Flutter V2 has 5 tabs; web V1 has 4 | Medium | Product scope — do not add Feed without decision |
| Premium gates absent on web | High | Free users see paid Flutter content |
| Insights tab absent | Medium | Deep rune editorial split across Today + `/runes/[id]` |
| Onboarding flow mismatch | Medium | Pre-auth + preview + account steps missing on web |
| 24 vs 28 lesson count | Low | Marketing copy vs runtime |
| Purchase flow unwired | High | Courses locked except dev override |
| Dual theme not fully aligned | Medium | Web has partial light auth + dark shell |

---

## Recommended build order (summary)

See `phase-1-next-build-plan.md` for full phased plan.

1. **Phase 2** — Brand/theme foundation (cosmic tokens + auth light system)
2. **Phase 3** — Auth parity (welcome flow, Apple placeholder policy)
3. **Phase 4** — Onboarding parity (preview step, flow alignment)
4. **Phase 5** — Today parity (rune hero scale, cinematic nav, premium gate placeholders)
5. **Phase 6** — Moon/rune polish
6. **Phase 7** — Courses/library
7. Later — PWA, push, admin, PayPal, deploy

---

## Related docs

- `phase-1-screen-map.md`
- `phase-1-web-gap-map.md`
- `phase-1-next-build-plan.md`
- `phase-0-mystic-source-status.md`
- `mystic-source-audit.md` (older Windows audit — reconcile tab count with `b39cad1`)
