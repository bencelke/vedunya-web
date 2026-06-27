# Phase 23A — Profile Flutter Mystic parity (minus admin)

## Summary

Redesigned `/en/profile` and `/ru/profile` to match Mystic Flutter profile structure: cosmic shell, back header, profile hero, grouped glass cards with gold icons, and four sections (Account, Mystic Plus, Preferences, App & Legal). Administration / Control Hub is not rendered on the normal profile page.

## Flutter files inspected (read-only)

| File | Purpose |
|------|---------|
| `lib/features/profile/profile_screen.dart` | Main profile layout, hero, sections, admin gate |
| `lib/features/profile/widgets/profile_action_row.dart` | Row + section label + cosmic panel styling |
| `lib/core/i18n/strings.dart` | EN/RU profile copy keys |
| `lib/theme/cosmic_tokens.dart` | Gold/void colors (referenced via decorations) |

Admin section in Flutter is gated by `AdminAccessService.watchCanAccessControlHub()` — omitted entirely on web profile.

## Web files changed

### New

- `src/features/profile/components/profile-page-header.tsx`
- `src/features/profile/components/profile-hero.tsx`
- `src/features/profile/components/profile-section-label.tsx`
- `src/features/profile/components/profile-cosmic-panel.tsx`
- `src/features/profile/components/profile-action-row.tsx`
- `src/features/profile/components/profile-edit-panel.tsx`
- `src/features/profile/tests/phase-23a-profile-flutter-parity.test.ts`
- `docs/migration/phase-23a-profile-flutter-parity.md`

### Updated

- `src/features/profile/components/profile-content.tsx` — full Mystic parity layout
- `src/app/[locale]/profile/page.tsx` — removed `AppHeader`, cosmic shell only
- `src/messages/en.json`, `ru.json`, `de.json` — `profile.screen.*` keys
- `src/styles/mystic-theme.css` — profile panel/row/hero styles
- `src/features/profile/tests/phase-12d-profile-settings-parity.test.ts`
- `src/features/notifications/tests/web-push.test.ts`
- `src/features/pwa/tests/pwa-foundation.test.ts`
- `src/features/universe-request/tests/phase-12b-request-the-universe.test.ts`

### Unchanged but retained

Legacy section components (`profile-account-section.tsx`, etc.) remain in repo for reference; profile page no longer mounts them directly.

## Sections implemented

| Section | Rows |
|---------|------|
| **Account / Profile** | Email (info), Edit Profile (expand panel), Apple, Google, Restore Purchases, Log Out |
| **Mystic Plus** | Description + Unlock Mystic Plus, Subscription status |
| **Preferences** | Request to the Universe → `/today`, Notifications (expand), Language (expand) |
| **App & Legal** | About, Privacy, Terms, Support |

Removed from profile UI: Courses section, separate legal/support cards, top `AppHeader` with language pills.

## Admin section removal

- No `Administration`, `Control Hub`, or `Manage feed` copy in `profile-content.tsx`
- No admin links or `isAdmin` checks on profile page
- Confirmed in `phase-23a-profile-flutter-parity.test.ts`

## Route / link behavior

| Row | Behavior |
|-----|----------|
| Edit Profile | Toggles inline `ProfileEditPanel` (name, DOB, language) |
| Apple / Google | Shows Connected if provider present; otherwise disabled + Coming soon |
| Restore Purchases | Disabled + Coming soon on web (no fake restore) |
| Log Out | Real `signOut` + `disablePushOnLogout`, pending guard |
| Unlock Mystic Plus / Subscription | Link to `/{locale}/plus` (display-only checkout) |
| Request to the Universe | Link to `/{locale}/today` |
| Notifications | Expands `PwaInstallSection` + `NotificationSettingsCard` |
| Language | Expands language edit panel |
| About / Privacy / Terms / Support | `TRUST_ROUTES.*` |

Back arrow: `router.back()` or fallback to `/{locale}/today`.

## i18n status

| Locale | Status |
|--------|--------|
| EN | Full `profile.screen` copy |
| RU | Full localized copy per spec |
| DE | English fallback values (no machine translation) |

Hero fallback name: `Mystic User` / `Пользователь Mystic`. No UID shown.

## Tests added

`phase-23a-profile-flutter-parity.test.ts` — 15 assertions covering header, hero, sections, admin removal, Mystic Plus links, logout, provider honesty, EN/RU/DE keys, mobile layout.

Updated: phase-12d, web-push, pwa-foundation, phase-12b universe request tests.

## Manual QA result

Run `npm run dev`, viewport 390–430px:

- [ ] `/en/profile` — cosmic background, back + Profile title, hero, grouped cards
- [ ] `/ru/profile` — RU section titles and row copy
- [ ] No Administration / Control Hub
- [ ] Mystic Plus pill + rows link to `/plus`
- [ ] Edit Profile expands save form
- [ ] Notifications expands push + PWA install
- [ ] Legal links open about/privacy/terms/support
- [ ] Logout works with single-tap pending state
- [ ] No horizontal scroll; bottom nav clears content

*Automated validation passed; full device visual pass recommended.*

## Validation

| Command | Result |
|---------|--------|
| `npm run lint` | Pass (1 pre-existing PWA script warning) |
| `npm test` | Pass — 1053 tests |
| `npm run build` | Pass |

## Known gaps

- Apple/Google account linking not implemented on web (rows honest: Connected or Coming soon)
- Restore Purchases not implemented on web
- Mystic Plus checkout remains display-only on `/plus`
- German profile copy uses EN fallback until translated
- Courses access not shown on profile (courses live under bottom nav `/courses`)
- Admin tools should live on a separate protected route when added later

## Safety

- No commit / push / deploy
- Flutter untouched
- `.env.local` untouched
- No secrets printed
