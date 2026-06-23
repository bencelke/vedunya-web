# Web Push VAPID setup

Phase 9 uses standards-based Web Push with VAPID keys. Generate keys locally and add them to environment variables manually. Never commit the private key.

## 1. Generate VAPID keys locally

```bash
npx web-push generate-vapid-keys
```

## 2. Add values to `.env.local`

Paste the generated values manually:

```env
NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY=PUBLIC_KEY_HERE
WEB_PUSH_PRIVATE_KEY=PRIVATE_KEY_HERE
WEB_PUSH_SUBJECT=mailto:support@vedunya.com
```

- `NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY` is safe for the browser and used by the client `PushManager.subscribe()` flow.
- `WEB_PUSH_PRIVATE_KEY` stays server-only and is read by `/api/push/*` routes.
- `WEB_PUSH_SUBJECT` should be a `mailto:` or `https:` contact URI for your push application.

Restart the Next.js dev server after updating `.env.local`.

## 3. Add the same env vars to Vercel

Add the same three variables in the Vercel project settings for preview and production deployments.

## 4. Security rules

- Never commit `WEB_PUSH_PRIVATE_KEY`.
- Never print private keys in logs, docs, or test output.
- Do not store VAPID private keys in client bundles or service worker files.

## 5. Manual verification

1. Sign in on a supported browser.
2. Open Profile → Notifications.
3. Tap **Enable reminders** after any required PWA install step.
4. Tap **Send test notification**.

Real iPhone Home Screen testing works best on HTTPS deployment or an installed PWA.
