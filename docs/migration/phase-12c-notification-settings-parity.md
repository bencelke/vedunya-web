# Phase 12C — Notification settings parity and Request reminder integration

## Flutter notification files inspected (read-only)

| File | Purpose |
|------|---------|
| `lib/models/notification_preferences.dart` | Master toggle, morning/evening times, mirror moments (premium) |
| `lib/features/profile/notification_settings_screen.dart` | Profile notification UI |
| `lib/features/profile/widgets/notification_pre_permission_dialog.dart` | Permission pre-prompt |
| `lib/services/notification_preferences_service.dart` | Preference persistence |
| `lib/services/notification_service.dart` | Local/scheduled delivery |
| `lib/services/notification_copy_service.dart` | Rotated Firestore copy for morning/midday/evening |
| `lib/services/notifications/notification_copy_provider.dart` | Copy provider wiring |

**Parity targets adopted:** calm Profile reminders section, morning/midday/evening slots, honest opt-in defaults, permission recovery, no fake guarantee copy. Flutter midday and universe-request slots are web extensions aligned with Mystic product direction.

## Current web push architecture

- **Subscriptions:** `users/{uid}/pushSubscriptions/{endpointHash}`
- **Preferences:** `users/{uid}/notificationPreferences/default`
- **APIs:** `/api/push/subscribe`, `/unsubscribe`, `/preferences`, `/status`, `/test`
- **Client:** `usePushNotifications` hook — permission only on Enable action
- **PWA:** disabled in dev via `isPwaEnabled`; iPhone requires installed PWA
- **Scheduled dispatch:** documented in `docs/setup/web-push-scheduled-reminders.md` — **not deployed**

## Preference data model

```ts
{
  enabled: boolean;
  morning: { enabled: boolean; time: string };   // default 08:30
  midday: { enabled: boolean; time: string };    // default 13:00
  evening: { enabled: boolean; time: string };   // default 20:30
  universeRequest: { enabled: boolean; time: string }; // default 09:00, off
  timezone: string;
  locale: "en" | "ru";
  updatedAt: Timestamp;
}
```

Merge-safe writes via `mergeNotificationPreferences`. Server auth determines UID.

## Profile UI changes

- Section label **Reminders** / **Напоминания**
- Device status, enable/disable, test notification (unchanged flow)
- `ReminderPreferenceForm` adds **Request the Universe** slot
- Disabled with copy when no active request exists
- Subtle scheduler honesty note (settings save now; server cron not live)
- iPhone install note shortened per spec
- Saving state on preference form

## Request reminder integration

- **Source of truth:** `notificationPreferences.default.universeRequest`
- **Mirror:** `users/{uid}/universeRequests/current.reminderEnabled/reminderTime` synced on preference save (best-effort)
- **Today:** read-only `UniverseRequestReminderStatus` — links to Profile
- **Request form:** reminder toggle removed; hint points to Profile

## Scheduler status and limitations

Automatic morning/midday/evening/universe-request delivery requires server cron/worker (not implemented this phase). Test notifications via `/api/push/test` work when VAPID is configured. UI copy is honest and non-prominent.

## Notification copy library

`src/features/notifications/content/notification-copy.ts` — EN/RU templates for morning, midday, evening, universeRequest, test. No fake guarantee phrases.

## PWA / iPhone behavior

- Android Chrome: push after user enables reminders
- iPhone: Home Screen install + open from icon
- Safari tab: no push promise
- Dev mode: reminders unavailable (`statusDevUnavailable`)

## API changes

- `notificationPreferencesSchema` extended with `universeRequest`
- `/api/push/test` uses `getNotificationCopy(locale, "test")`
- Preference merge triggers universe-request mirror sync via `/api/push/preferences`

## Tests added

`src/features/notifications/tests/phase-12c-notification-settings-parity.test.ts` — defaults, validation, auth, Profile UI, Request integration, copy library, scheduler note, iPhone copy, dev mode.

Updated `web-push.test.ts` for new copy and schema.

## Validation results

```text
assets:check  — passed (46 assets)
lint          — passed (1 pre-existing PWA warning)
test          — 483 passed (39 files)
build         — passed
verify:firebase — passed
content:check — passed (Firestore)
sanity:check  — passed
courses:check — passed (28 lessons)
```

Manual QA recommended: `/en/profile`, `/ru/profile`, `/en/today`, `/ru/today` — reminders section, request reminder status, test notification, iPhone copy, mobile widths.

## Remaining gaps

- Scheduled server dispatch (cron/worker) not deployed
- Flutter mirror moments (11:11, 22:22) not ported — premium web scope deferred
- Firestore rotated `notification_copy` collection not used on web (static templates for now)

## Safe for Phase 12D?

**Yes** — notification settings parity is complete; Profile/settings parity (12D) can proceed independently.

## Files created/modified

**Created**

- `src/features/notifications/content/notification-copy.ts`
- `src/features/notifications/server/sync-universe-request-reminder.ts`
- `src/features/universe-request/components/universe-request-reminder-status.tsx`
- `src/features/notifications/tests/phase-12c-notification-settings-parity.test.ts`
- `docs/migration/phase-12c-notification-settings-parity.md`

**Modified**

- `src/features/notifications/types/push.ts`
- `src/features/notifications/schemas/push-schema.ts`
- `src/features/notifications/repositories/push-repository.ts`
- `src/features/notifications/components/reminder-preference-form.tsx`
- `src/features/notifications/components/notification-settings-card.tsx`
- `src/app/api/push/test/route.ts`
- `src/app/[locale]/profile/page.tsx`
- `src/features/profile/components/profile-content.tsx`
- `src/features/universe-request/types.ts`
- `src/features/universe-request/server/load-universe-request.ts`
- `src/features/universe-request/components/universe-request-active-card.tsx`
- `src/features/universe-request/components/universe-request-form.tsx`
- `src/features/universe-request/components/universe-request-empty-state.tsx`
- `src/features/universe-request/components/universe-request-section.tsx`
- `src/messages/en.json`, `src/messages/ru.json`
- `src/features/notifications/tests/web-push.test.ts`

**Removed**

- `src/features/universe-request/components/universe-request-reminder-toggle.tsx` (replaced by Profile source of truth + read-only status)

**Not modified:** Flutter, `.env.local`, Firebase config, deterministic engines.
