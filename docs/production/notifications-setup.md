# Production notifications setup

Mystic Web Push reminders require VAPID keys, a protected cron caller, and (for reliable delivery) **hourly** scheduler coverage.

## Required environment variables

Set in Vercel **Production** (and Preview if testing push there). Never commit real values.

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY` | Client subscribe (public VAPID key) |
| `WEB_PUSH_PRIVATE_KEY` | Server send (private VAPID key) |
| `WEB_PUSH_SUBJECT` | VAPID subject, e.g. `mailto:support@vedunya.com` |
| `SCHEDULED_REMINDERS_SECRET` | Bearer token for `/api/cron/send-reminders` |
| `CRON_SECRET` | Optional alias (some hosts use this name) |
| `NOTIFICATION_SCHEDULER_MODE` | `external` or `hourly` when coverage is adequate; `daily` or omit for limited |

## Generate VAPID keys

Run locally (do not commit output):

```bash
npx web-push generate-vapid-keys
```

Then set:

```text
NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY=<public key>
WEB_PUSH_PRIVATE_KEY=<private key>
WEB_PUSH_SUBJECT=mailto:support@vedunya.com
SCHEDULED_REMINDERS_SECRET=<strong random secret>
NOTIFICATION_SCHEDULER_MODE=external
```

Redeploy after changing env vars.

## Required deploy conditions

- HTTPS production domain
- Valid service worker (`public/sw.js`)
- Valid web manifest (`/manifest.webmanifest`)
- **iPhone:** user must install Mystic to Home Screen and open from the icon (iOS 16.4+)

Without VAPID keys, Profile shows reminders as not configured and the dispatcher returns `web_push_not_configured`.

## Scheduler (critical)

The dispatcher uses a **15-minute local due window** per reminder slot. A caller must hit the cron route often enough for each user's local time.

### Recommended: external hourly scheduler

Do **not** rely on Vercel Hobby daily cron alone for all reminder times.

Example (generic):

```http
GET https://vedunya-web.vercel.app/api/cron/send-reminders
Authorization: Bearer <SCHEDULED_REMINDERS_SECRET>
```

Schedule: **every hour** (`0 * * * *` or equivalent on your cron provider).

Optional query params:

| Param | Values | Purpose |
|-------|--------|---------|
| `dryRun` | `1` | Count matches without sending push |
| `type` | `morning`, `evening`, `course`, `universeRequest` | Filter one reminder type |

### Vercel `vercel.json` cron (limited)

Current repo config:

```json
"schedule": "0 9 * * *"
```

This runs **once per day at 09:00 UTC**. With only this cron, **only reminders due during that 15-minute window** in each user's local timezone will send. Morning, evening, course, and universe-request slots at other local times will not fire.

For Hobby plans that do not support hourly Vercel cron, use an **external hourly caller** and set:

```text
NOTIFICATION_SCHEDULER_MODE=external
```

If you intentionally use daily Vercel cron only:

```text
NOTIFICATION_SCHEDULER_MODE=daily
```

Profile UI will show a calm note that scheduled delivery depends on production scheduler setup.

## Dry-run QA (no push sent)

```http
GET /api/cron/send-reminders?dryRun=1
Authorization: Bearer <SCHEDULED_REMINDERS_SECRET>
```

Expected JSON summary: `checkedUsers`, `sent`, `skipped`, `failed`, `expiredRemoved`, `dryRun: true`.

- No Web Push send
- No endpoints, UIDs, or secrets in logs
- Safe server logs: `[push-dispatch] ...` counts only

Filter by type:

```http
GET /api/cron/send-reminders?dryRun=1&type=course
Authorization: Bearer <SCHEDULED_REMINDERS_SECRET>
```

## Test notification (single device)

Authenticated user only:

```http
POST /api/push/test
```

Body includes current device `endpoint`; optional `type` for reminder preview.

## Device QA checklist

1. VAPID env vars set on production
2. External hourly cron configured (or accept daily limitation)
3. `NOTIFICATION_SCHEDULER_MODE=external` (or `hourly`)
4. Install PWA on test iPhone / enable on Android or desktop
5. Profile → Enable notifications → save reminder toggles
6. Send test notification from Profile
7. Dry-run cron in production; then monitor first real hourly window

## Related docs

- [Phase 24B migration](../migration/phase-24b-scheduled-notification-dispatcher.md)
- [Phase 24C migration](../migration/phase-24c-production-notification-readiness.md)
