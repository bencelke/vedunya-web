# Web Push scheduled reminders

Phase 9 stores subscriptions and reminder preferences, supports manual test notifications, and documents scheduled delivery honestly. There is no Firebase Functions package in this repository yet, so scheduled reminders are **not running automatically**.

## What exists in Phase 9

- Firestore subscription storage under `users/{uid}/pushSubscriptions/{subscriptionHash}`
- Firestore reminder preferences under `users/{uid}/notificationPreferences/default`
- Profile UI for enable/disable, reminder types, and times
- Authenticated test send via `POST /api/push/test`
- Service worker push display and click handling

## What does not exist yet

- No Cloud Scheduler job
- No Firebase Cloud Function for daily reminder dispatch
- No Vercel Cron route for reminder fan-out

## Recommended Phase 9B options

Choose one deployment path:

### Option A — Firebase Cloud Scheduler + Cloud Functions

1. Add a `functions/` package to the Firebase project.
2. Create a scheduled function such as `sendDailyReminderPush`.
3. Query enabled subscriptions whose local time matches morning/midday/evening preferences.
4. Send via the same VAPID `web-push` utility used by the Next.js API.
5. Remove or disable subscriptions that return HTTP 404/410.

### Option B — Vercel Cron + secure API route

1. Add a protected cron route or server job.
2. Use a secret bearer token checked server-side.
3. Scan Firestore for due reminders and send with `web-push`.
4. Rate-limit and log failures safely.

### Option C — Manual test only

Until a scheduler is deployed, use Profile → **Send test notification** to verify device delivery.

## Reminder types for V1

- Morning guidance reminder
- Midday focus reminder
- Evening reflection reminder

## Safety requirements for scheduled delivery

- Respect `notificationPreferences.enabled` and per-slot toggles
- Use timezone from preferences, not server UTC only
- Never include private profile data in notification payloads
- Disable/remove expired subscriptions after push provider 404/410 responses
- Add light rate limiting before broad fan-out

## Current status

**Scheduled reminders are documented only.** Manual test notifications are available after VAPID env setup.
