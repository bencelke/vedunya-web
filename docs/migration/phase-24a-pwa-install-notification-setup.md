# Phase 24A — PWA install + Profile notification setup

## Summary

Production-ready PWA install guidance and Profile notification setup UI on top of existing Web Push infrastructure. Honest state-aware UX: no permission prompts on first visit, no fake enabled toggles, iOS Home Screen install guidance before push.

## Platform behavior

| Platform | Install | Notifications |
|----------|---------|---------------|
| **iOS Safari** | Share → Add to Home Screen instructions (no fake install button) | Requires installed PWA; push from icon only (iOS 16.4+) |
| **Android Chrome** | `beforeinstallprompt` → Install Mystic button | Permission after explicit Enable tap |
| **Desktop** | Browser install when available; calm copy otherwise | Same permission flow when supported |
| **Dev (`npm run dev`)** | PWA disabled | Honest “production HTTPS only” message |

## iOS install limitation

Web Push on iPhone requires:

1. Add Mystic to Home Screen
2. Open Mystic from the installed icon (standalone mode)
3. Profile → Notifications → Enable notifications

In-browser Safari tab alone is not sufficient for reliable push.

## Files changed / added

### New

- `src/features/pwa/use-pwa-install-state.ts` — client install/permission/platform detection
- `src/features/pwa/components/install-mystic-card.tsx` — Mystic cosmic install card
- `src/features/notifications/components/notification-settings-panel.tsx` — Profile panel (install + permission + toggles)
- `src/features/notifications/tests/phase-24a-pwa-install-notification-setup.test.ts`
- `docs/migration/phase-24a-pwa-install-notification-setup.md`

### Updated

- `src/config/pwa.ts` — `start_url: /ru`, theme `#080A10`
- `src/features/profile/components/profile-content.tsx` — uses `NotificationSettingsPanel`
- `src/features/notifications/types/push.ts` — `course` reminder slot
- `src/features/notifications/schemas/push-schema.ts` — `course` field
- `src/features/notifications/repositories/push-repository.ts` — course defaults
- `src/features/notifications/components/reminder-preference-form.tsx` — course toggle, optional `hideMidday`
- `public/sw.js` — default `/ru/today`, improved `notificationclick` navigate/focus
- `src/messages/en.json`, `ru.json`, `de.json` — panel + iOS full install copy
- PWA / web-push / phase-12c tests updated

### Reused (unchanged API surface)

- `POST /api/push/subscribe`
- `POST /api/push/unsubscribe`
- `POST /api/push/preferences`
- `GET /api/push/status`
- `POST /api/push/test` (authenticated, VAPID required)

## Firestore structure (existing)

```text
users/{uid}/pushSubscriptions/{endpointHash}
users/{uid}/notificationPreferences/default
```

Preferences document includes: `morning`, `midday`, `evening`, `course`, `universeRequest`, `enabled`, `timezone`, `locale`.

## Env vars required

Documented in `.env.example` (not committed with secrets):

```text
NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY=
WEB_PUSH_PRIVATE_KEY=
WEB_PUSH_SUBJECT=mailto:support@vedunya.com
```

When unset, UI shows honest “not configured” — no fake delivery.

## Service worker behavior

- `push` → `showNotification` with title/body/icon/badge, `data.url` default `/ru/today`
- `notificationclick` → focus matching window, navigate same-origin client, or `openWindow`
- No `skipWaiting` on install (reload-loop hardening preserved)
- API/auth paths never cached

## UI states (Profile → Notifications)

1. **Not installed (iOS)** — full Share → Home Screen instructions
2. **Not installed (Android)** — Install Mystic button when `beforeinstallprompt` available
3. **Installed** — “Mystic is installed on this device.”
4. **Permission default** — Enable notifications CTA (user gesture only)
5. **Permission denied** — browser settings recovery copy
6. **Subscribed** — reminder toggles (morning, evening, course, universe request) + optional test push
7. **VAPID missing** — not configured message, toggles locked

Reminder toggles hidden until `enabled && subscribed`.

## Tests added

`phase-24a-pwa-install-notification-setup.test.ts` — 16 assertions (manifest, install state, panel, auth, SW, i18n, schema).

Updated: `pwa-foundation.test.ts`, `web-push.test.ts`, `phase-12c-notification-settings-parity.test.ts`.

## Manual QA

Run `npm run dev`, viewport 390–430px:

- [ ] `/ru/profile` → Notifications expands panel
- [ ] No permission prompt on first page load
- [ ] Enable only after explicit tap
- [ ] iOS instructions visible when not standalone
- [ ] Toggles locked before subscribe
- [ ] No console errors / reload loop

Production (HTTPS + installed PWA): Android install prompt, iPhone Home Screen flow, test push when VAPID configured.

*Automated validation passed in dev session.*

## Validation

| Command | Result |
|---------|--------|
| `npm run lint` | Pass |
| `npm test` | Pass |
| `npm run build` | Pass |

## Known gaps

- Midday reminder hidden in Profile panel UI (still in schema for backward compatibility)
- German uses EN fallback for new strings
- Production iPhone push requires manual device QA
- Vercel Hobby cron runs once daily — see [Phase 24B](./phase-24b-scheduled-notification-dispatcher.md)

## Follow-up

Scheduled reminder dispatch completed in **Phase 24B**: [phase-24b-scheduled-notification-dispatcher.md](./phase-24b-scheduled-notification-dispatcher.md)

## Safety

- No commit / push / deploy
- Flutter untouched
- `.env.local` untouched
- No secrets printed
