# Phase 12D — Profile / Settings parity

## Flutter files inspected (read-only)

| File | Purpose |
|------|---------|
| `lib/features/profile/profile_screen.dart` | Main settings hub — account, Mystic Plus, library, notifications, language, legal |
| `lib/features/profile/edit_profile_screen.dart` | Name / personal details edit |
| `lib/features/profile/language_settings_screen.dart` | Language picker |
| `lib/features/profile/notification_settings_screen.dart` | Reminder settings |
| `lib/features/premium/premium_paywall_screen.dart` | Paywall (not ported) |
| `lib/services/premium_access_service.dart` | Premium entitlement read |
| `lib/services/user_profile_snapshot_service.dart` | Profile load |

**Parity targets:** sectioned settings hub, account identity, personal details, language, Mystic Plus status, learning/library link, notifications, legal/support, clean logout. Admin section intentionally omitted on web for normal users.

## Web Profile files inspected

- `src/app/[locale]/profile/page.tsx` — server load: profile, push status, universe request, settings summary
- `src/features/profile/components/profile-content.tsx` — composed settings hub
- Phase 12B universe request, Phase 12C `NotificationSettingsCard`, existing profile save via `updateUserProfileFields`

## Sections added/changed

| Section | Component |
|---------|-----------|
| Header | `profile-header.tsx` |
| Account | `profile-account-section.tsx` |
| Personal details | `profile-personal-details-section.tsx` |
| Language | `profile-language-section.tsx` |
| Request the Universe | `profile-universe-request-section.tsx` |
| Reminders + PWA | `profile-reminders-section.tsx` |
| Mystic Plus | `profile-subscription-section.tsx` |
| Learning | `profile-courses-section.tsx` |
| Legal | `profile-legal-section.tsx` |
| Support | `profile-support-section.tsx` |
| Logout | `profile-logout-section.tsx` |

Shared wrapper: `profile-section-card.tsx`

## Profile data model

Unchanged Firestore paths (`users/{uid}`, `user_private/{uid}`). Editable fields:

- `displayName`, `dob`, `language` via existing merge-safe `updateUserProfileFields`

## Language behavior

- Profile stores preferred language in Firestore
- Saving a new language updates profile and navigates to `/[locale]/profile` when route locale differs (same pattern as onboarding)
- No auto-reload loops

## Request integration

- `loadProfileSettingsSummary` loads active request text for summary card
- Link to Today for edit (Today remains primary surface)

## Notification integration

- `ProfileRemindersSection` wraps Phase 12C `NotificationSettingsCard` + `PwaInstallSection`
- No raw endpoints or subscription IDs in UI

## Subscription placeholder

- Uses `resolvePremiumAccess(profile)` for honest Active vs Free status
- Web note: premium opens soon — no checkout, no fake restore

## Legal / support

- Inline disclaimer text (EN/RU)
- Privacy / Terms marked “Coming soon” (full pages deferred to Phase 12F)
- Support: `vedunyamaria@gmail.com` mailto link

## Visual / mobile notes

- Glass elevated cards, `mystic-reading-column`, section spacing `space-y-6`
- Test at 320–768px and desktop

## Tests added

`src/features/profile/tests/phase-12d-profile-settings-parity.test.ts`

Updated: `phase-12b-request-the-universe.test.ts`, `web-push.test.ts`

## Validation results

```text
assets:check  — passed
lint          — passed (1 pre-existing PWA warning)
test          — 498 passed (40 files)
build         — passed
verify:firebase — passed
```

## Remaining gaps

- Full legal pages (`/legal/privacy`, `/terms`) — Phase 12F
- PayPal / subscription management — Phase 12E
- Flutter mirror moments, restore purchases on web
- Course catalog shows Living the Runes progress only (matches existing course service)

## Safe for Phase 12E?

**Yes** — Profile settings hub is complete; subscription/paywall placeholder parity can build on `ProfileSubscriptionSection`.

## Not modified

Flutter, `.env.local`, Firebase config, deterministic engines.
