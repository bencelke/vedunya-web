# Mystic UI Parity Audit

Audit date: 2026-06-23  
Web project: `/Users/boris/Documents/vedunya-web`  
Flutter source on MacBook: **not found**

## Source availability

| Source | Status |
|--------|--------|
| Live `mystic_app` on MacBook | **Unavailable** — searched `/Users/boris/development/`, `/Users/boris/Documents/`, `/Users/boris/` |
| Prior read-only Flutter audit | `docs/migration/mystic-source-audit.md` (Windows path `C:\Users\1\development\mystic_app`, 2026-06-13) |
| Asset migration report | `docs/migration/full-asset-migration-report.md` |
| Today composition audit | `docs/migration/today-composition-report.md`, `today-screen-audit.md` |

**Flutter was not modified.** Visual decisions in this stage use documented production Flutter references and already-migrated assets — not invented UI from memory.

---

## Production Flutter screens (from prior audit)

### Bootstrap & auth

| Screen | Flutter file | Notes |
|--------|--------------|-------|
| Launch splash | `lib/screens/launch_splash_screen.dart` | Brand logo, min 1.2s |
| Onboarding | `lib/features/onboarding/onboarding_flow.dart` | 5 steps: welcome, name, DOB, preview, account |
| Welcome auth | `lib/screens/welcome_auth_screen.dart` | Google, Apple, email CTAs |
| Login | `lib/screens/login_screen.dart` | Email/password |
| Register | `lib/screens/register_screen.dart` | Email/password |
| Profile setup | `lib/screens/profile_setup_screen.dart` | DOB + language → Firestore |

### Production V1 tabs

| Tab | Flutter screen | Web route |
|-----|----------------|-----------|
| Today | `oracle_screen.dart` + `daily_guidance_panel.dart` | `/today` |
| Insights | `deeper_guidance_placeholder_screen.dart` | **Not in web V1 nav** |
| Moon | `moon_phase_screen.dart` | `/moon` |
| Library | `library_screen.dart` | `/courses` |

Bottom nav: `lib/widgets/navigation/mystic_bottom_nav.dart` — Feed hidden.

---

## Deprecated / hidden / excluded

| Feature | Status | Web action |
|---------|--------|------------|
| Social feed | Implemented, unwired | **Excluded** |
| Card of the Day | Not V1 web | **Excluded** |
| Feed tab | Hidden in V1 nav | **Excluded** |
| 3D gnome / cinematic experiments | Abandoned | **Excluded** |

---

## Visual system

| Area | Web implementation |
|------|-------------------|
| App interior | Dark premium + `app-background.jpg` overlay |
| Auth / onboarding | Light ivory/gold `AuthShell` |
| Typography | Gold eyebrows, Geist Sans EN/RU |
| Today hierarchy | Message-first (documented web decision) |

---

## Assets used

See `docs/migration/mystic-ui-asset-map.md`.
