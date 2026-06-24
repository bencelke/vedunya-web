# Web Push scheduled reminders

Phase 14 adds server-side scheduled dispatch. Phase 9–12 built subscription storage, preferences UI, test send, and service worker display.

## What exists now

- Firestore subscription storage under `users/{uid}/pushSubscriptions/{subscriptionHash}`
- Firestore reminder preferences under `users/{uid}/notificationPreferences/default`
- Profile UI for enable/disable, reminder types, and times
- Authenticated test send via `POST /api/push/test`
- Service worker push display and click handling
- **Vercel Cron** → `GET /api/cron/send-reminders` (every 15 minutes)
- Duplicate-send protection via `users/{uid}/notificationDeliveries/{yyyyMMdd_type}`
- Expired subscription cleanup on push 404/410

## Cron route

| Item | Value |
|------|--------|
| Path | `/api/cron/send-reminders` |
| Auth | `Authorization: Bearer ${SCHEDULED_REMINDERS_SECRET}` |
| Dry run | `?dryRun=1` |
| Type filter | `?type=morning` |

See `docs/migration/phase-14-scheduled-notification-dispatch.md` for full architecture.

## Reminder types

- Morning guidance
- Midday reset
- Evening reflection
- Request the Universe (only when an active request exists)

## Safety requirements (implemented)

- Respect `notificationPreferences.enabled` and per-slot toggles
- Use timezone from preferences (invalid → UTC fallback)
- Never include private request text in notification payloads
- Remove expired subscriptions after push provider 404/410
- One delivery per reminder type per local day per user

## Vercel setup

1. Set `SCHEDULED_REMINDERS_SECRET` in Production and Preview
2. Set `CRON_SECRET` to the same value (Vercel auto-sends this bearer on cron invocations)
3. Ensure VAPID keys are configured
4. Redeploy

## Manual test

Use Profile → **Send test notification** for a single-device check.

For scheduler dry-run:

```bash
curl -H "Authorization: Bearer YOUR_SECRET" \
  "https://YOUR-DOMAIN/api/cron/send-reminders?dryRun=1"
```

## Alternative: Firebase Cloud Functions

Option A (Cloud Scheduler + Functions) remains valid for teams that prefer Firebase-native scheduling instead of Vercel Cron.
