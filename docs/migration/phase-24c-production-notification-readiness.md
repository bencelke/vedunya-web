# Phase 24C — Production notification readiness

## Summary

Makes Mystic notification scheduling **honest** for production: documents daily Vercel cron limitations, keeps dispatcher ready for hourly coverage, adds scheduler status to push API, and softens Profile copy so users are not told all reminders are fully scheduled when coverage is limited.

**Follows:** [Phase 24B — Scheduled notification dispatcher](./phase-24b-scheduled-notification-dispatcher.md)

## Cron limitation found

`vercel.json` runs once daily:

```text
0 9 * * *
```

Phase 24B dispatcher matches users in a **15-minute local window**. One daily cron at 09:00 UTC cannot cover morning (09:00), evening (20:00), course (18:00), and universe-request (10:00) slots across timezones.

## Selected production strategy

**Option C — External hourly scheduler (recommended for now)**

- Keep `GET /api/cron/send-reminders` as the real dispatcher
- Do **not** pretend Vercel daily cron covers all reminders
- App code remains compatible with hourly calls (no change to due-window logic)
- Set `NOTIFICATION_SCHEDULER_MODE=external` (or `hourly`) when hourly caller is configured
- Leave `vercel.json` daily cron as optional backup / smoke trigger only

Hourly Vercel cron was **not** enabled (Hobby plan limitation / unverified Pro assumption).

## Files changed

| File | Change |
|------|--------|
| `src/features/notifications/server/scheduler-config.ts` | Mode + coverage helpers |
| `src/features/notifications/server/push-status.ts` | Scheduler fields on status |
| `src/features/notifications/types/push.ts` | `PushStatusSummary` / `PushStatusResponse` types |
| `src/features/notifications/hooks/use-push-notifications.ts` | Pass scheduler fields to client |
| `src/features/notifications/components/notification-settings-panel.tsx` | Show delivery note when limited |
| `src/features/notifications/components/reminder-preference-form.tsx` | `schedulerDeliveryNote` |
| `src/messages/en.json`, `ru.json`, `de.json` | Honest scheduler copy |
| `.env.example` | `NOTIFICATION_SCHEDULER_MODE`, `CRON_SECRET` |
| `docs/production/notifications-setup.md` | Production setup guide |
| `docs/migration/phase-24b-scheduled-notification-dispatcher.md` | Daily limitation + link |
| `src/features/notifications/tests/phase-24c-*.test.ts` | Readiness tests |
| Updated phase-12c, phase-14, phase-12g, phase-24b tests | Copy + status expectations |

## Env vars required

```env
NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY=
WEB_PUSH_PRIVATE_KEY=
WEB_PUSH_SUBJECT=mailto:support@vedunya.com
SCHEDULED_REMINDERS_SECRET=
CRON_SECRET=                          # optional alias
NOTIFICATION_SCHEDULER_MODE=external  # or hourly | daily | unknown
```

Generate VAPID keys:

```bash
npx web-push generate-vapid-keys
```

## External / hourly scheduler instructions

```http
GET https://<production-domain>/api/cron/send-reminders
Authorization: Bearer <SCHEDULED_REMINDERS_SECRET>
```

- Schedule: every hour
- Optional: `?dryRun=1`, `?type=morning|evening|course|universeRequest`
- See [docs/production/notifications-setup.md](../production/notifications-setup.md)

## Dry-run behavior

`dryRun=1` increments `sent` for would-send matches without calling `sendWebPushToUser`. No push delivered. Safe aggregate JSON only.

## UI honesty behavior

| Condition | UI |
|-----------|-----|
| VAPID missing | Existing not-configured state |
| Reminders enabled + subscribed + scheduler limited | `schedulerDeliveryNote` (EN/RU) |
| `NOTIFICATION_SCHEDULER_MODE=hourly` or `external` + secret set | No delivery limitation note |

`schedulerNote` no longer claims server schedules all reminders automatically.

## Push status API

`GET /api/push/status` now includes:

```ts
schedulerConfigured: boolean;   // cron secret present
schedulerMode: "unknown" | "daily" | "hourly" | "external";
schedulerCoverageAdequate: boolean;  // hourly or external
```

## Tests added

- `phase-24c-production-notification-readiness.test.ts`
- Updated scheduler copy tests in phase-12c, phase-14, phase-12g, phase-24b

## Known gaps

- Real device push QA still requires production VAPID + HTTPS deploy + installed PWA
- External hourly cron must be configured manually on hosting provider
- Vercel daily cron in `vercel.json` remains; not removed (optional backup)
- `midday` slot still not dispatched

## Safety

- No commit / push / deploy
- Flutter untouched
- `.env.local` untouched
- No secrets printed
