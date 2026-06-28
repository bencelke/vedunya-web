# Phase 24B — Scheduled notification dispatcher

## Summary

Completes scheduled Web Push reminder delivery for Mystic Profile notification preferences. Builds on Phase 14 scheduler and Phase 24A Profile UI.

**Follows:** [Phase 24A — PWA install + Profile notification setup](./phase-24a-pwa-install-notification-setup.md)

## Existing scheduler found

| Component | Path |
|-----------|------|
| Cron route | `GET /api/cron/send-reminders` |
| Dispatcher | `src/features/notifications/server/scheduled-reminder-dispatcher.ts` |
| Due-time logic | `src/features/notifications/server/reminder-due.ts` |
| Web Push send | `src/features/notifications/server/send-web-push.ts` |
| Cron auth | `src/features/notifications/server/cron-auth.ts` |
| Vercel cron | `vercel.json` → `0 9 * * *` (daily, Hobby-compatible) |

Phase 24B adds `course` to schedulable types, excludes `midday` from dispatch, updates deterministic copy/URLs, and adds safe dispatch logging.

## Reminder type mapping

| Profile concept | Firestore preference slot | Scheduler `ReminderType` |
|-----------------|---------------------------|--------------------------|
| Morning guidance | `morning` | `morning` |
| Evening reflection | `evening` | `evening` |
| Course reminder | `course` | `course` |
| Universe request | `universeRequest` | `universeRequest` |

Canonical map: `src/features/notifications/constants/reminder-preference-map.ts`

`midday` remains in schema and Firestore for backward compatibility but is **not** scheduled.

## Schedulable types

```ts
["morning", "evening", "course", "universeRequest"]
```

## Firestore preference structure

Path: `users/{uid}/notificationPreferences/default`

```ts
{
  enabled: boolean,
  morning: { enabled, time },
  midday: { enabled, time },      // stored, not scheduled
  evening: { enabled, time },
  course: { enabled, time },
  universeRequest: { enabled, time },
  timezone: string,
  locale: "en" | "ru",
  updatedAt: string
}
```

Default local times (new users):

| Type | Time |
|------|------|
| morning | 09:00 |
| evening | 20:00 |
| course | 18:00 |
| universeRequest | 10:00 |

Timezone: `notificationPreferences/default.timezone` (from subscribe / Profile). Invalid timezone falls back to UTC.

## Delivery state structure

Path: `users/{uid}/notificationDeliveries/{yyyyMMdd_reminderType}`

Fields: `reminderType`, `localDate`, `timezone`, `sentAt`, `updatedAt`

Prevents duplicate sends for the same reminder type on the same local calendar date.

## Notification content (RU / EN)

| Type | EN body | RU body |
|------|---------|---------|
| morning | Your daily guidance is ready. | Ваша подсказка дня готова. |
| evening | Time for a short evening reflection. | Время короткого вечернего размышления. |
| course | Return to your lesson and continue the practice. | Вернитесь к уроку и продолжите практику. |
| universeRequest | Remember your request to the Universe today. | Вспомните свой запрос к Вселенной на сегодня. |

Title: `Mystic` (both locales). Source: `src/features/notifications/content/notification-copy.ts`

## Click URLs

| Type | URL |
|------|-----|
| morning | `/{locale}/today` |
| evening | `/{locale}/today` |
| course | `/{locale}/courses` |
| universeRequest | `/{locale}/today` |

Locale: `en` if preference locale is `en`, otherwise `ru`.

## Cron route

- **Path:** `GET /api/cron/send-reminders`
- **Auth:** `Authorization: Bearer <SCHEDULED_REMINDERS_SECRET>` or `CRON_SECRET`
- **Query:** `dryRun=1`, `type=morning|evening|course|universeRequest`
- Returns aggregate counts only (no UIDs, endpoints, or payloads)

Safe logs: `[push-dispatch] start|usersMatched|sent|skipped|inactive|complete`

## Vercel cron / env requirements

```env
NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY=
WEB_PUSH_PRIVATE_KEY=
WEB_PUSH_SUBJECT=mailto:support@vedunya.com
SCHEDULED_REMINDERS_SECRET=   # or CRON_SECRET
NOTIFICATION_SCHEDULER_MODE=external  # recommended when using external hourly caller
```

Without VAPID keys, dispatcher returns `web_push_not_configured` (503). Profile UI shows honest not-configured state.

### Daily cron limitation (important)

`vercel.json` currently schedules **one run per day** at `09:00 UTC` (`0 9 * * *`). The dispatcher only sends when a user's local reminder time falls inside the **15-minute due window** at cron execution time.

**With only one daily cron, most users will not receive all enabled reminders.**

For production-ready coverage, use an **external hourly caller** (or Vercel hourly cron on a plan that supports it). See [Production notifications setup](../production/notifications-setup.md) and [Phase 24C](./phase-24c-production-notification-readiness.md).

## Test endpoint

`POST /api/push/test` — authenticated current user only.

Optional body:

```json
{ "endpoint": "...", "locale": "ru", "type": "course" }
```

`type` values: `morning`, `evening`, `course`, `universeRequest`. Omit `type` for generic test notification.

## Dispatch rules

1. User `enabled === true`
2. Slot `enabled === true`
3. Local time within 15-minute window of slot time
4. Active push subscription exists
5. No delivery doc for today (local date)
6. `universeRequest`: active universe request document exists
7. Expired subscriptions (404/410) marked inactive, cron continues

## Tests added

- `src/features/notifications/tests/phase-24b-scheduled-notification-dispatcher.test.ts`
- Updated: `phase-14`, `phase-12c`, `phase-24a`, `web-push` tests

## Manual QA

Run `npm run dev` and verify `/ru/profile` and `/en/profile`:

- Notification toggles render (morning, evening, course, universe request)
- Course toggle saves via preferences API
- Toggles disabled until subscribed + enabled
- Test notification button visible when configured
- If `WEB_PUSH_PRIVATE_KEY` missing locally: not-configured warning shown

## Known gaps

- **Scheduler coverage:** Vercel Hobby daily cron is not enough for all local reminder times — see [Phase 24C](./phase-24c-production-notification-readiness.md) and [production setup](../production/notifications-setup.md).
- `midday` slot stored but not dispatched.
- DE locale uses EN notification copy fallback.
- Universe request reminder requires an active request document (not just toggle on).
