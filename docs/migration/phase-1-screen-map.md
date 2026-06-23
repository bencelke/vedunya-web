# Phase 1 — Screen Map

Flutter commit: `b39cad1` | Web commit: `3e12994`

| Flutter screen / file | Web route / file | Status | Priority | Notes |
|----------------------|------------------|--------|----------|-------|
| `launch_splash_screen.dart` | — | missing | P2 | Defer to PWA/splash phase |
| `onboarding_flow.dart` (pre-auth) | `/onboarding` | partial | P1 | Web is post-auth only |
| `welcome_auth_screen.dart` | `/login` | partial | P0 | Web merges welcome+login+register |
| `login_screen.dart` | `login-form.tsx` | matched | P1 | Logic OK; visual polish in Phase 3 |
| `register_screen.dart` | `register-form.tsx` | matched | P1 | Toggle on same page |
| — | `/forgot-password` | web-only | P2 | Flutter has no forgot password |
| `profile_setup_screen.dart` | `/onboarding` | partial | P1 | Overlaps web onboarding |
| `home_shell.dart` | `app-shell.tsx` | partial | P0 | 5 Flutter tabs vs 4 web tabs |
| `oracle_screen.dart` | `/today` | partial | P0 | Hierarchy + premium gates differ |
| `daily_guidance_panel.dart` | `daily-guidance-*.tsx` | partial | P0 | Rune-first vs message-first |
| `insights_tab_screen.dart` | — | missing | P1 | No Insights route |
| `deeper_guidance_placeholder_screen.dart` | `/runes/[runeId]` | partial | P1 | Partial deep content on detail |
| `moon_phase_screen.dart` | `/moon` | partial | P1 | Core OK; premium/location missing |
| `library_screen.dart` | `/courses` | partial | P1 | Catalog + naming differ |
| `library_detail_screen.dart` | `/courses/[slug]` | partial | P1 | Purchase lock unwired |
| `runes_first_steps_lesson_screen.dart` | `/courses/.../lessons/[id]` | matched | P1 | Living the Runes reader works |
| `social_feed_page.dart` | — | excluded | — | Out of web V1 scope |
| `profile_screen.dart` | `/profile` | partial | P1 | Web tab vs pushed; settings thin |
| `notification_settings_screen.dart` | — | missing | P2 | Under profile in Flutter |
| `premium_paywall_screen.dart` | — | missing | P2 | Deferred to PayPal phase |
| `admin_control_hub_screen.dart` | — | missing | P2 | Deferred to admin phase |
| `mystic_bottom_nav.dart` | `bottom-navigation.tsx` | partial | P0 | Custom icons vs Lucide |
| `MysticBackground` | `mystic-app-page` CSS | partial | P1 | JPG overlay present; blur differs |

**Legend:** matched = core behavior present; partial = visible but meaningful gaps; missing = no web equivalent; excluded = intentional V1 omission.
