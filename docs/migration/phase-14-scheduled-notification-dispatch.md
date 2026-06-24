# Phase 14 — Scheduled notification dispatch

Server-side Mystic reminders via Vercel Cron and a protected API route.

## Architecture

```text
Vercel Cron (daily on Hobby — 09:00 UTC)
  → GET /api/cron/send-reminders
  → verify Authorization: Bearer secret
  → dispatchScheduledReminders()
      → collectionGroup(notificationPreferences) where enabled == true
      → per user: due-time match in user timezone (15 min window)
      → skip if no enabled push subscriptions
      → skip universeRequest if no active request
      → skip if notificationDeliveries/{yyyyMMdd_type} exists
      → sendWebPushToUser() with localized payload
      → write delivery doc after ≥1 successful send
      → remove expired subscriptions on 404/410
```

## Cron route

| Item | Value |
|------|--------|
| Path | `/api/cron/send-reminders` |
| Method | `GET` |
| Runtime | Node.js (`firebase-admin` + `web-push`) |
| Auth | `Authorization: Bearer ${SCHEDULED_REMINDERS_SECRET}` (also accepts `CRON_SECRET`) |

### Query params

| Param | Effect |
|-------|--------|
| `dryRun=1` | Count due reminders; send nothing |
| `type=morning` | Only evaluate one reminder type (`midday`, `evening`, `universeRequest`) |

### Safe response

```json
{
  "ok": true,
  "checkedUsers": 0,
  "sent": 0,
  "skipped": 0,
  "failed": 0,
  "expiredRemoved": 0,
  "dryRun": false
}
```

No endpoints, emails, request text, or secrets are returned.

## Vercel configuration

`vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/send-reminders",
      "schedule": "0 9 * * *"
    }
  ]
}
```

**Vercel Hobby compatibility:** On Vercel Hobby, scheduled reminders use a **daily** cron only (`0 9 * * *` — 09:00 UTC). **15-minute** reminder dispatch requires **Vercel Pro** or an external scheduler. The API route `/api/cron/send-reminders` remains available for manual invocation, dry-run, and future higher-frequency schedules. This is a **deployment compatibility** change, not a product behavior upgrade.

## Required env vars

| Variable | Required | Notes |
|----------|----------|-------|
| `SCHEDULED_REMINDERS_SECRET` | Yes (for cron) | Strong random string; not `NEXT_PUBLIC_` |
| `CRON_SECRET` | Recommended on Vercel | Set to same value as above so Vercel auto-injects bearer |
| `NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY` | Yes (to send) | Without VAPID, route returns 503 `web_push_not_configured` |
| `WEB_PUSH_PRIVATE_KEY` | Yes (to send) | Server-only |
| `WEB_PUSH_SUBJECT` | Optional | Default `mailto:support@vedunya.com` |
| Firebase Admin vars | Yes | Firestore reads/writes |

Add to **Production** and **Preview**, then redeploy.

## Firestore paths

| Path | Purpose |
|------|---------|
| `users/{uid}/notificationPreferences/default` | Master + slot toggles, times, timezone, locale |
| `users/{uid}/pushSubscriptions/{subscriptionHash}` | Enabled device endpoints |
| `users/{uid}/universeRequests/current` | Active request check for universe reminder |
| `users/{uid}/notificationDeliveries/{yyyyMMdd_reminderType}` | Duplicate-send guard |

### Delivery document

```typescript
{
  reminderType: "morning" | "midday" | "evening" | "universeRequest";
  localDate: "yyyy-MM-dd";
  sentAt: Timestamp;
  timezone: string;
}
```

Written only after at least one successful push to an enabled subscription.

## Preference model

Matches existing Phase 12 schema (`NotificationPreferencesRecord`):

- `enabled` — master toggle (must be `true`)
- `morning` / `midday` / `evening` / `universeRequest` — `{ enabled, time: "HH:mm" }`
- `timezone` — IANA string; invalid values fall back to `UTC`
- `locale` — `en` | `ru`

## Due-time logic

- On **Vercel Hobby**, cron runs once daily at 09:00 UTC; due-time matching still uses the user's local `HH:mm` and timezone at dispatch time
- With **Vercel Pro** or an external scheduler at 15-minute intervals, the original 15-minute send window applies: `localMinutes >= scheduledMinutes && localMinutes < scheduledMinutes + 15`
- Compare user's local `HH:mm` (from `Intl` + timezone) to configured slot time

## Duplicate protection

One send per `reminderType` per user per **local calendar day** (user timezone).

## Expired subscription cleanup

`sendWebPushToEndpoint` deletes subscriptions on HTTP 404/410 from the push provider (unchanged from Phase 12).

## Request reminder behavior

Sends only when:

1. Global notifications enabled
2. `universeRequest` slot enabled and due
3. Active universe request exists (`readUniverseRequest`)
4. At least one enabled push subscription
5. No delivery doc for today
6. VAPID configured

Push body uses generic copy — **never** the private request text.

## Payload copy

From `src/features/notifications/content/notification-copy.ts`:

| Type | EN body | URL |
|------|---------|-----|
| morning | A quiet start for your day is ready. | `/{locale}/today` |
| midday | Pause for a minute. Choose your next clear step. | `/{locale}/today` |
| evening | Return to the day gently. Notice what mattered. | `/{locale}/today` |
| universeRequest | Return to your request for one quiet minute. | `/{locale}/today?focus=request` |

## Profile copy

Updated `notifications.schedulerNote` and added `deliveryDependsNote` — server scheduling is live; delivery still depends on device/browser permissions.

## Local testing

1. Add `SCHEDULED_REMINDERS_SECRET` to `.env.local` (not committed).
2. `npm run dev`
3. Without auth: `curl -i http://localhost:3000/api/cron/send-reminders` → **401**
4. Dry run:

```bash
curl -i \
  -H "Authorization: Bearer $SCHEDULED_REMINDERS_SECRET" \
  "http://localhost:3000/api/cron/send-reminders?dryRun=1"
```

## Production deployment steps

1. Merge Phase 14 to `main`
2. Vercel auto-deploys
3. Add `SCHEDULED_REMINDERS_SECRET` (+ matching `CRON_SECRET` for auto bearer)
4. Confirm VAPID + Firebase Admin env vars
5. Redeploy
6. Verify 401 without secret; dry-run 200 with secret
7. Enable reminders on a test device; wait for due window or use `?type=` filter in dry-run

## Firestore index

`collectionGroup("notificationPreferences").where("enabled", "==", true)` may require a composite index on first production run. Create the index from the Firebase Console link in the error log if prompted.

## Known limitations

- Prototype scans all users with `enabled: true` — fine for early rollout; not optimized for large scale
- **Vercel Hobby:** cron runs daily only (`0 9 * * *` UTC). Sub-15-minute reminder delivery requires Vercel Pro or an external scheduler calling `/api/cron/send-reminders`
- No per-user retry queue; failed sends do not write delivery docs
- Users without push subscriptions are skipped silently
- Local `npm run dev` does not run Vercel Cron — test via curl

## Validation results

Run before commit:

```bash
npm run assets:check
npm run lint
npm test
npm run build
```

Optional with Firebase env:

```bash
npm run verify:firebase
npm run content:check
npm run sanity:check
npm run courses:check
```

## Ready for Phase 15?

**Yes**, once Vercel env secrets and VAPID keys are configured and a real device dry-run/manual send is verified.

Next: **Phase 15 — PayPal payments and entitlements.**
