# Web UI Gap Report

Date: 2026-06-23

## Summary

Pre-parity web app had correct data logic but prototype-level auth/shell visuals. This report tracks gaps closed in the Mystic visual parity layer.

## Login / register

| Gap | Resolution |
|-----|------------|
| Plain dark auth page | `AuthShell` light/gold layout |
| Missing Mystic logo | `MysticLogo` wordmark |
| Generic Google button | Branded Google SVG button |
| No Apple CTA | Disabled Apple placeholder |
| Weak copy | Updated EN/RU `auth` messages |

## Onboarding

| Gap | Resolution |
|-----|------------|
| Dark shell with bottom nav | `OnboardingShell` |
| No progress indicator | `ProgressSteps` |
| Prototype ready-step copy | Product-ready messaging |
| Plain welcome | Makosh emblem |

## App shell

| Gap | Resolution |
|-----|------------|
| Flat background | `mystic-app-page` + JPG overlay |
| Generic bottom nav | Gold active indicator |
| Profile link only on Today | Header `showProfile` on signed-in routes |

## Today

| Gap | Resolution |
|-----|------------|
| Weak brand presence | White Mystic wordmark header |
| Flat primary card | Enhanced depth and glow |
| Small rune visual | Larger rune anchor ring |

**Engines unchanged.**

## Profile

| Gap | Resolution |
|-----|------------|
| Basic list layout | Account status + elevated cards |
| No subscription placeholder | Safe future Mystic Plus copy |

## Remaining gaps

- Insights tab (Flutter tab 1) — deferred
- Premium paywall UI — deferred
- Landing page full Mystic parity — partial
- Launch splash animation — deferred to PWA stage
- Custom nav icon set — optional polish
