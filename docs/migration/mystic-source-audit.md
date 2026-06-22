# Mystic Source Audit

Read-only audit of the production Mystic Flutter app for web migration planning.

| Item | Value |
|------|--------|
| Flutter project | `C:\Users\1\development\mystic_app` |
| Web project | `C:\Users\1\development\vedunya-web` |
| App version (pubspec) | `1.0.0+14` |
| Audit date | 2026-06-13 |
| Flutter modified | **No** |

---

## Architecture summary

### Runtime entry

```
main.dart → AuthGate → (splash | onboarding | welcome auth | profile setup | App)
App → MobileAppRoot → HomeShell (IndexedStack, 4 tabs)
```

Navigation is **imperative** (`Navigator.push` / `MaterialPageRoute`). **GoRouter is not used** in production. Named routes in `lib/core/routing/app_router.dart` are stubs; live apps set `MaterialApp(home: …)` directly.

### Production V1 shell

| Tab | Label key | Screen | Source |
|-----|-----------|--------|--------|
| 0 | `nav_today` | `OracleScreen` | `lib/features/main/oracle_screen.dart` |
| 1 | `nav_insights` | `DeeperGuidancePlaceholderScreen` | `lib/features/daily_guidance/deeper_guidance_placeholder_screen.dart` |
| 2 | `nav_moon` | `MoonPhaseScreen` | `lib/features/moon/moon_phase_screen.dart` |
| 3 | `nav_library` | `LibraryScreen` | `lib/features/main/library_screen.dart` |

Bottom nav: `lib/widgets/navigation/mystic_bottom_nav.dart` — **Feed tab hidden** from V1 nav.

### Core data flow (Today)

```
UserProfileSnapshotService
  → DailyGuidanceLoader (DOB + profileComplete gates)
  → MoonInputBuilderService → MoonContextService → LunarDayContentService (Firestore)
  → DailyGuidanceComposer (Sujok numerology + modular rune + premium editorial)
  → Firestore enrichments (cards, moon_phases, daily_editorial_states)
  → DailyGuidanceLoadedView UI (premium gates)
```

### Content backends

| Domain | Primary source | Fallback |
|--------|----------------|----------|
| Daily guidance numerology | Local Sujok dataset | — |
| Daily rune (Today) | Local `lib/core/runes/*` | Placeholder dataset |
| Rune deep content (Insights) | Firestore `runes/{id}` | Local modular runes |
| Moon astronomy | Local synodic engine | — |
| Moon / lunar copy | Firestore `moon_phases`, `lunar_days` | Bundled fallback maps |
| Premium editorial | Firestore `daily_editorial_states` | Bundled `premium_daily_states_data.dart` |
| Library catalog | Sanity GROQ | `local_library_fallback.dart` |
| Paid course bodies | **Local Dart** (short-circuit) | Sanity (unused for V1 paid slugs) |
| Course progress | Firestore `users/{uid}/courseProgress/{courseId}` | SharedPreferences |
| Notifications copy | Firestore `notification_copy/{stateId}` | Embedded EN/RU banks |
| Premium entitlements | RevenueCat client + Firestore profile flags | Super-admin email override |

---

## Screen inventory

### Active production-relevant

#### Bootstrap & auth

| Screen | File | Entry | Notes |
|--------|------|-------|-------|
| Launch splash | `lib/screens/launch_splash_screen.dart` | `AuthGate` | Brand logo, min 1.2s |
| Onboarding flow | `lib/features/onboarding/onboarding_flow.dart` | Pre/post auth | 5 pages: welcome, name, DOB, preview, account |
| Welcome auth | `lib/screens/welcome_auth_screen.dart` | After onboarding, unsigned | Google, Apple, email CTAs |
| Login | `lib/screens/login_screen.dart` | Push | Email/password only |
| Register | `lib/screens/register_screen.dart` | Push | Email/password |
| Profile setup | `lib/screens/profile_setup_screen.dart` | Signed-in incomplete profile | DOB + language → Firestore |

#### V1 tabs

| Screen | File | Data sources | Premium gates |
|--------|------|--------------|---------------|
| **Today (Oracle)** | `oracle_screen.dart` + `daily_guidance_panel.dart` | `DailyGuidanceLoader` | Locked rune depth, moon deep, action CTAs → paywall |
| **Insights** | `deeper_guidance_placeholder_screen.dart` + `rune_insights_sections.dart` | Same loader + `RuneContentService` | Topic sections locked for free users |
| **Moon** | `moon_phase_screen.dart` | Moon engine + Firestore lunar days | Extended lunar fields premium-only |
| **Library** | `library_screen.dart` | Sanity + local catalog merge | Free / paid IAP / premium subscription locks |

#### Pushed routes

| Screen | File | Purpose |
|--------|------|---------|
| Profile | `lib/features/profile/profile_screen.dart` | Account hub, Plus, settings, admin entry |
| Edit profile | `edit_profile_screen.dart` | Name, DOB |
| Notification settings | `notification_settings_screen.dart` | Morning/evening/mirror toggles |
| Language settings | `language_settings_screen.dart` | EN/RU |
| Premium paywall | `lib/features/premium/premium_paywall_screen.dart` | RevenueCat subscriptions |
| Mystic Plus active | `mystic_plus_active_screen.dart` | Subscribed state |
| Library detail | `library_detail_screen.dart` | Course overview + CTA |
| Course lesson reader | `runes_first_steps_lesson_screen.dart` | Block reader, progress |
| Universe request | `universe_request_screen.dart` | Intention CRUD |
| Moon manual location | `moon_manual_location_screen.dart` | City/timezone prefs |

#### Admin (staff-gated)

Entry: Profile → Administration when `AdminAccessService.canAccessControlHub()`.

Hub: `lib/features/admin/presentation/admin_control_hub_screen.dart`

Sub-screens: feed admin, bot control, runes admin, moon admin, insights admin, library admin (Sanity read-only), settings admin, member management.

**Security note:** Hub verifies access on init and pops if denied — **UI-only gate**, not route middleware. Firestore rules provide server-side enforcement for writes.

### Hidden but reusable

| Feature | Files | Status |
|---------|-------|--------|
| **Social feed** | `lib/features/social/presentation/pages/social_feed_page.dart` + detail/notifications/composer | Fully implemented, **not mounted** in V1 nav |
| Remote feature flags | `app_remote_settings_repository.dart` | Admin UI exists; consumer tab hiding not fully wired |
| Firestore smoke test | `firestore_smoke_test_screen.dart` | Built, unwired |

### Deprecated / abandoned

| Screen | File | Superseded by |
|--------|------|---------------|
| AppShell | `lib/app/app_shell.dart` | `HomeShell` |
| TodayPage | `lib/features/today/today_page.dart` | `OracleScreen` |
| WebAppShell | `lib/app/web_app_shell.dart` | Mobile AuthGate path |
| NumberScreen / NumerologyPage | `lib/features/number/`, `numerology/` | Embedded in Today; web-only legacy |
| LibraryPage / ProfilePage stubs | `library_page.dart`, `profile_page.dart` | Real profile/library screens |
| Ask Mystic | `ask_mystic_screen.dart` | Zero call sites |
| Ancestors rituals | `ancestors_screen.dart` | No app entry |
| Your Code / Connections | `your_code_screen.dart`, `connections_screen.dart` | No navigation |
| Orphan admin screens | `bot_operations_dashboard_screen.dart`, etc. | Consolidated into bot hub |

---

## Service inventory

| Service | Path | Role |
|---------|------|------|
| AuthService | `lib/services/auth_service.dart` | Email, Google, Apple, sign-out |
| AuthOrchestrator | `lib/features/auth/application/auth_orchestrator.dart` | Post-auth bootstrap pipeline |
| UserBootstrapService | `lib/features/auth/application/user_bootstrap_service.dart` | Merge-safe `users` + `user_private` |
| UserProfileService | `lib/services/user_profile_service.dart` | Profile complete, DOB, notification prefs |
| UserProfileSnapshotService | `lib/services/user_profile_snapshot_service.dart` | Guidance profile read path |
| DailyGuidanceLoader | `lib/services/daily_guidance/daily_guidance_loader.dart` | Today pipeline orchestrator |
| DailyGuidanceComposer | `lib/services/daily_guidance/daily_guidance_composer.dart` | Compose oracle bundle |
| PersonalDayNumerologyService | `lib/services/daily_guidance/personal_day_numerology_service.dart` | **Sujok** personal day |
| RuneModularDailyService | `lib/services/daily_guidance/rune_daily_service.dart` | Deterministic daily rune |
| MoonEngineService | `lib/services/daily_guidance/moon_engine_service.dart` | Synodic astronomy |
| MoonContextService | `lib/services/daily_guidance/moon_context_service.dart` | Unified moon context |
| RuneContentService | `lib/services/rune_content_service.dart` | Firestore rune CMS |
| PremiumService | `lib/services/premium_service.dart` | RevenueCat SDK |
| PremiumAccessService | `lib/services/premium_access_service.dart` | UI premium truth |
| NotificationService | `lib/services/notification_service.dart` | Local notifications |
| NotificationCopyService | `lib/services/notification_copy_service.dart` | Firestore `notification_copy` |
| SanityService | `lib/services/sanity_service.dart` | Library CMS GROQ |
| CourseProgressService | `lib/services/course_progress_service.dart` | Firestore course progress |
| AdminAccessService | `lib/features/admin/application/admin_access_service.dart` | Admin hub gate |

---

## Critical architecture facts (do not guess during migration)

### 1. Two numerology systems

| System | Used by Today | Formula |
|--------|---------------|---------|
| **Sujok** | `PersonalDayNumerologyService` | `reduceToDigit1to9(day + month + year + dobDay + dobMonth)` |
| **Classical** | Profile, Number tab, legacy `TodayReadingService`, Cloud Functions | `personalYear → personalMonth → personalDay` with master 11/22/33 |

**Web Today parity must use Sujok**, not classical.

### 2. Rune canonical ID

Firestore and Flutter canonical ID for Raidho is **`raido`**, not `raidho`. Cloud Functions `ELDER_FUTHARK_KEYS` uses `raidho` — **known cross-stack inconsistency**.

### 3. Today rune content source

Today tab uses **local modular runes** (`lib/core/runes/*`), not Firestore `runes` collection. Deep/affirmation/reflection are empty on Today; Insights tab loads Firestore.

### 4. Paid course content

`living-the-runes` (`runes_24_inner_strength`) and `lunar-path-30-days` are **hard-pinned to local Dart** in `course_content_resolver.dart`. Sanity seeds exist but are not loaded at runtime.

### 5. Notification templates

Runtime uses **`notification_copy/{stateId}`**, not `app_content/notification_templates`. The latter exists in seed data only.

### 6. Notification tap navigation

`onDidReceiveNotificationResponse` is **empty** — payloads set but no deep-link handling.

### 7. No password reset, no anonymous auth

Email/password only for credential auth. No `sendPasswordResetEmail`. No Firebase anonymous sign-in.

### 8. Premium on web

RevenueCat is **platform-gated off on web** (`kIsWeb`). PayPal does not exist in Flutter — must be new on web.

### 9. Firestore rules gaps

`app_settings`, `feature_flags`, `daily_insights` referenced in admin/smoke test but **denied by catch-all rules** — likely Admin SDK or rules update needed in production.

---

## Migration risks

| Risk | Severity | Detail |
|------|----------|--------|
| Dual numerology formulas | **High** | Wrong formula breaks Today parity |
| `raido` vs `raidho` ID drift | **High** | Firestore doc misses if wrong ID used |
| Sujok vs classical in shared TS | **High** | Existing TS in mystic_app may use classical |
| Moon TZ not applied to math | **Medium** | Document local-date behavior; UTC engine |
| Course ID mismatch (local vs Sanity) | **Medium** | Progress keys follow active content source |
| Lesson count 28 local vs 24 Sanity | **Medium** | Catalog/marketing mismatch |
| UI-only admin gate | **Medium** | Web admin must use custom claims + server checks |
| No server IAP verification | **Medium** | Web PayPal needs server-side entitlement writes |
| Firestore rules vs admin settings | **Medium** | Settings docs blocked for client |
| Notification deep links absent | **Low** | Web push can define new behavior |
| Social feed unwired | **Low** | Defer or port later |
| Saved readings UI only | **Low** | No Firestore collection exists |

---

## Recommended migration order

See `web-build-roadmap.md` for staged implementation. Summary:

1. Asset migration (SVG runes, moon PNGs, course covers, brand)
2. Firebase Web connection (read-only content first)
3. Authentication (preserve `users` / `user_private` contracts)
4. Profile and onboarding (DOB gate, locale)
5. Numerology engine (**Sujok** for Today)
6. Moon engine (synodic formula + Firestore copy)
7. Rune engine (seed formula + canonical IDs)
8. Daily guidance aggregation
9. Today UI parity
10. Courses (local content port first)
11. Course progress (Firestore subcollection)
12. Admin panel (custom claims)
13. PWA installation
14. Web Push notifications
15. PayPal entitlements
16. Security and QA
17. Vercel deployment

---

## Related documents

- `data-contracts.md` — Firestore and TypeScript contracts
- `asset-manifest.md` — Reusable media inventory
- `parity-test-cases.md` — Deterministic test fixtures
- `web-build-roadmap.md` — Staged web implementation plan
