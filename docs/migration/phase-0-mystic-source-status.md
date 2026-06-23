# Phase 0 — Mystic Flutter Source Status

Date: 2026-06-23  
Web project path: `/Users/boris/Documents/vedunya-web`  
Flutter source path: `/Users/boris/Documents/mystic_app`  
Expected Flutter path: `/Users/boris/Documents/mystic_app`

Repo URL: `https://github.com/bencelke/mystic_app`

Clone/pull result:
- Target folder existed and was **empty** (only `.` / `..`).
- `git clone https://github.com/bencelke/mystic_app .` **failed** — private repo, HTTPS credentials not configured on this MacBook.
- `git clone git@github.com:bencelke/mystic_app.git .` **succeeded** via SSH.
- No nested `mystic_app/mystic_app` folder created.
- No local files overwritten.

Flutter source found: **yes**  
Found paths:
- `/Users/boris/Documents/mystic_app` (selected)

Selected source path: `/Users/boris/Documents/mystic_app`

## Project validity

| Check | Status |
|-------|--------|
| `pubspec.yaml` | **yes** — `name: mystic_app`, `version: 1.0.0+1` |
| `lib` folder | **yes** |
| `assets` folder | **yes** |
| git repo | **yes** |
| branch | `main` |
| remote | `git@github.com:bencelke/mystic_app.git` (fetch/push) |
| latest commit | `b39cad1` — *Mystic V2: live Firestore feed, post creation working, index fix, feed ordering improved, admin delete groundwork* |

Working tree after clone: **clean** (`git status --short` empty).

## Important engine files

| File | Status |
|------|--------|
| `lib/services/daily_guidance/personal_day_numerology_service.dart` | **found** |
| `lib/services/daily_guidance/moon_engine_service.dart` | **found** |
| `lib/services/daily_guidance/rune_daily_service.dart` | **found** |
| `lib/services/rune_content_service.dart` | **found** |
| `lib/constants/rune_asset_map.dart` | **found** |
| `lib/constants/moon_asset_map.dart` | **found** |

## Important UI areas found

| Area | Key files | Status |
|------|-----------|--------|
| auth/login | `lib/screens/login_screen.dart`, `lib/screens/welcome_auth_screen.dart`, `lib/screens/register_screen.dart` | **found** |
| onboarding | `lib/features/onboarding/onboarding_flow.dart` | **found** |
| Today/oracle | `lib/features/main/oracle_screen.dart`, `lib/features/daily_guidance/daily_guidance_panel.dart` | **found** |
| profile | `lib/features/profile/profile_screen.dart` | **found** |
| Moon | `lib/features/moon/moon_phase_screen.dart` | **found** |
| rune | rune-related files under `lib/` (part of 148 UI-related matches) | **found** |
| courses/library | `lib/features/main/library_screen.dart` | **found** |
| paywall | `lib/features/premium/premium_paywall_screen.dart` | **found** |
| notifications | `lib/features/profile/notification_settings_screen.dart`, `lib/services/notification_service.dart` | **found** |
| shell / nav | `lib/features/home/home_shell.dart`, `lib/widgets/navigation/mystic_bottom_nav.dart` | **found** |
| splash | `lib/screens/launch_splash_screen.dart` | **found** |

UI-related file search under `lib/` (login, auth, register, onboarding, today, oracle, profile, moon, rune, course, library, paywall, notification): **148 files** matched.

## Asset categories found

| Category | Path | File count (approx.) |
|----------|------|---------------------|
| brand/logo | `assets/logo/`, `assets/app_icon/` | 15 + 3 |
| moon | `assets/moon/` | 23 |
| runes | `assets/runes/` | 48 |
| courses | `assets/Course Visuals/` | 6 |
| backgrounds | `assets/background/` | 2 |
| icons | `assets/app_icon/` | 3 |
| cards | `assets/cards/` | 70 (not V1 web production) |
| fonts | `assets/fonts/` | 3 (do not copy to web assets) |

Other asset folders present: `design_reference/`, `orb/`, `ornaments/`, `textures/`.

Firebase mobile config files exist under `android/` and `ios/` but were **not opened or printed**.

## Safety

- Flutter modified: **no**
- Secrets printed: **no**
- Files copied into web app: **no**
- `flutter pub get` run: **no**
- Flutter build run: **no**
- Git commit/push: **no**

## Notes for Phase 1

- Use SSH remote (`git@github.com:bencelke/mystic_app.git`) for future pulls on this MacBook unless HTTPS credentials are configured.
- This clone is on branch `main` at commit `b39cad1`. Prior web migration audits referenced an older Windows checkout (`1.0.0+14`); reconcile version differences during Phase 1 audit.
- Feed/social features are present in this repo revision; web V1 should still exclude unwired experiments per production nav rules.

## Next action

Phase 1 — Run Flutter UI parity audit using the local Mystic source.
