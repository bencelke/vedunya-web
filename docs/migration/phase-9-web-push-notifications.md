# Phase 9 — Web Push notifications

Phase 9 adds production-safe standards-based Web Push for Vedunya Web / Mystic PWA.

## Flutter files inspected (read-only)

| File | Notes |
| --- | --- |
| `lib/features/profile/notification_settings_screen.dart` | Morning/evening reminder settings UI, permission recovery, opt-in flow |
| `lib/models/notification_preferences.dart` | Preference defaults and persistence shape |
| `lib/services/notification_preferences_service.dart` | Local/Firestore preference loading |
| `lib/services/notification_service.dart` | Native permission + scheduling (not ported directly) |

### Flutter parity copied to web

- Calm daily ritual reminder framing
- Morning and evening reminder toggles/times
- Permission recovery guidance when blocked
- Opt-in only; no automatic permission prompt after login

### Flutter behavior not ported to web

- Native iOS/Android local notification scheduling via Flutter plugins
- RevenueCat/premium gating around notification settings
- `notification_copy` Firestore templates for native delivery
- FCM/APNs native channel setup

Web adds a **midday focus** reminder for V1 web parity with the product brief.

## Technology decision

**Standards-based Web Push + VAPID** with the existing `public/sw.js` service worker.

### Why not FCM or OneSignal

- Phase 8 already established a custom service worker offline shell
- iOS PWA push is standards-based and works with VAPID subscriptions
- FCM web would add a second push stack and service worker coordination risk
- OneSignal is out of scope for this migration phase

Dependency added: `web-push` (server-side send only).

## Environment variables

Documented in `docs/setup/web-push-vapid-setup.md`:

```env
NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY=
WEB_PUSH_PRIVATE_KEY=
WEB_PUSH_SUBJECT=mailto:support@vedunya.com
```

`.env.local` is not modified by this phase. Add values manually.

## Firestore data model

### `users/{uid}/pushSubscriptions/{subscriptionHash}`

- `endpoint`, `keys.p256dh`, `keys.auth`
- `userAgent`, `platform`, `locale`, `timezone`
- `enabled`, `createdAt`, `updatedAt`, `lastSeenAt`
- `lastSuccessAt`, `lastFailureAt`, `failureCount`

Document ID is `sha256(endpoint)`.

### `users/{uid}/notificationPreferences/default`

- `enabled`
- `morning`, `midday`, `evening` each with `enabled` + `time` (`HH:mm`)
- `timezone`, `locale`, `updatedAt`

Writes are merge-safe. No changes to public `users/{uid}` profile contract.

## API routes

| Route | Purpose |
| --- | --- |
| `POST /api/push/subscribe` | Save current device subscription for authenticated user |
| `POST /api/push/unsubscribe` | Disable/remove current device subscription |
| `GET /api/push/status` | Configured state, preferences, delivery timestamps |
| `POST /api/push/preferences` | Save reminder preferences |
| `POST /api/push/test` | Send one test notification to current device |

All routes require session auth via `verifySessionCookie()`. UID is taken from the session only.

## Service worker behavior

Extended `public/sw.js` with:

- `push` — parse JSON payload safely, show Mystic branded notification
- `notificationclick` — focus/open app, default `/{locale}/today`
- `pushsubscriptionchange` — reserved hook for future resubscribe logic

Offline shell, update flow, and `NEVER_CACHE_PATTERNS` for `/api/*` remain intact. Cache version bumped to `mystic-shell-v2`.

## Profile notification UI

Added under Profile → App / Notifications:

- `NotificationSettingsCard`
- `NotificationPermissionState`
- `IosPushInstallRequirement`
- `ReminderPreferenceForm`
- `TestNotificationButton`

Permission is requested only when the user taps **Enable reminders**.

## Platform behavior

### iPhone / iOS

- Safari tab shows honest Add to Home Screen requirement
- No permission prompt until installed PWA context and explicit user action

### Android / Chromium

- Permission after direct user action
- Subscribe through active service worker

### Desktop

- Supported when Notification API + PushManager are available

## Manual test notification

`POST /api/push/test` sends one localized test payload to the current authenticated device subscription only.

## Scheduled reminder status

No scheduler is deployed in this repo. See `docs/setup/web-push-scheduled-reminders.md` for Phase 9B options.

## Web files created/modified

### Created

- `src/features/notifications/**`
- `src/app/api/push/**`
- `src/lib/auth/require-api-user.ts`
- `docs/setup/web-push-vapid-setup.md`
- `docs/setup/web-push-scheduled-reminders.md`
- `docs/migration/phase-9-web-push-notifications.md`

### Modified

- `public/sw.js`
- `src/features/profile/components/profile-content.tsx`
- `src/messages/en.json`, `src/messages/ru.json`
- `src/features/pwa/tests/pwa-foundation.test.ts`
- `package.json` / lockfile (`web-push`)

## Testing / QA

Automated:

```bash
npm run assets:check
npm run lint
npm test
npm run build
```

Manual:

1. Open `/en/profile` and `/ru/profile`
2. Confirm notification card renders
3. iPhone Safari not installed → install requirement only
4. Installed PWA / Android / desktop → Enable reminders after user tap
5. Denied permission → recovery copy
6. Disable reminders + logout cleanup
7. Send test notification on supported browser
8. Confirm offline fallback and PWA install still work

## Remaining gaps

- Scheduled morning/midday/evening dispatch job
- `pushsubscriptionchange` resubscribe automation
- Dedicated API rate limiting for test send (TODO if no shared helper exists)
- Production HTTPS/iPhone Home Screen QA on real devices

## Next phase recommendation

**Phase 10 — Admin panel with Firebase custom claims and server-side authorization.**
