# MacBook Firebase Local Setup — Vedunya Web

Manual setup guide for connecting the Next.js Vedunya Maria web app to the **same Firebase project** as the Mystic Flutter app on your MacBook.

**Do not commit real credentials.** Use `.env.local` locally only. Never place service account JSON files in this repo.

---

## Prerequisites

1. Clone/pull `vedunya-web` from GitHub.
2. Run `npm install`.
3. Ensure `.env.local` exists (copy from `.env.example` if needed):

```bash
cp .env.example .env.local
```

4. Confirm `.env.local` is Git-ignored:

```bash
git status --short
```

`.env.local` must **not** appear in the output.

---

## Why login shows “Firebase is not configured yet”

The login page checks for Firebase Web SDK environment variables. If any required `NEXT_PUBLIC_FIREBASE_*` value is missing or empty, the app shows that message instead of the login form.

Admin credentials (`FIREBASE_ADMIN_*`) are required for server-side session cookies after sign-in. Without them, client login may appear to work in the browser but session creation will fail.

---

## Step 1 — Open the existing Mystic Firebase project

In [Firebase Console](https://console.firebase.google.com/), open the **same project** used by the Mystic Flutter app so existing `users/{uid}` and `user_private/{uid}` documents remain compatible.

If you are unsure which project Mystic uses, check the Flutter app’s Firebase config files on a machine where Mystic is installed:

- `mystic_app/ios/Runner/GoogleService-Info.plist` → `PROJECT_ID`
- `mystic_app/android/app/google-services.json` → `project_info.project_id`
- `mystic_app/lib/firebase_options.dart` → `projectId`

**Important:** iOS/Android config identifies the Firebase **project**, but it is **not** the Web App SDK config. You must still register a Web app and copy Web-specific values (see Step 2).

---

## Step 2 — Register a Web app and copy Web SDK config

Firebase Console:

```text
Existing Mystic Firebase project
→ Project settings
→ General
→ Your apps
→ Add app
→ Web </>
→ App nickname: Vedunya Web
→ Register app
```

Copy the **Web SDK** config shown after registration into `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

**Do not** copy iOS `GOOGLE_APP_ID` or Android `mobilesdk_app_id` as `NEXT_PUBLIC_FIREBASE_APP_ID`. The Web app has its own App ID.

`NEXT_PUBLIC_FIREBASE_PROJECT_ID` and `FIREBASE_ADMIN_PROJECT_ID` must match the Mystic Firebase project ID.

---

## Step 3 — Create Admin SDK credentials

Firebase Console:

```text
Project settings
→ Service accounts
→ Generate new private key
```

**Do not** place the downloaded JSON file in this repository. Store it outside the repo (for example `~/secrets/`) or extract values directly into `.env.local`.

Add to `.env.local`:

```env
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
FIREBASE_SESSION_COOKIE_NAME=vedunya_session
```

### Private key format

`FIREBASE_ADMIN_PRIVATE_KEY` must be wrapped in double quotes with `\n` escaped newlines:

```env
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Paste the `private_key` value from the downloaded JSON. Replace literal line breaks with `\n`, or keep the JSON’s escaped `\n` sequences inside the quoted string.

`FIREBASE_ADMIN_CLIENT_EMAIL` is the `client_email` field from the same JSON.

`FIREBASE_ADMIN_PROJECT_ID` must equal `NEXT_PUBLIC_FIREBASE_PROJECT_ID`.

---

## Step 4 — Configure Firebase Authentication

### Authorized domains

Firebase Console:

```text
Authentication
→ Settings
→ Authorized domains
```

Ensure local development is allowed:

```text
localhost
```

For deployment later, also add:

```text
app.vedunya.com
```

### Sign-in providers

Firebase Console:

```text
Authentication
→ Sign-in method
```

Enable:

- **Email/Password**
- **Google** (configure support email in provider settings)

---

## Step 5 — Verify configuration

After filling `.env.local`, restart the dev server and run:

```bash
npm run verify:firebase
```

Expected output when complete:

```json
{
  "ok": true,
  "clientConfigured": true,
  "adminConfigured": true,
  "projectIdsMatch": true,
  "firestoreReachable": true,
  "authReachable": true
}
```

If variables are still missing, the script fails safely and lists **only missing variable names** — no secret values.

Optional additional checks:

```bash
npm run content:check
npm run assets:check
npm run lint
npm test
npm run build
```

Sanity env vars (`NEXT_PUBLIC_SANITY_*`, `SANITY_READ_TOKEN`) are optional for V1; local fallback catalog covers courses and content when Sanity is not configured.

---

## Step 6 — Start the app

```bash
npm run dev
```

Open:

```text
http://localhost:3000/en/login
```

Expected after valid `.env.local`:

- “Firebase is not configured yet” message disappears
- Email/password and Google login forms are shown
- Sign-in creates an HttpOnly session cookie via `POST /api/auth/session`

Test email/password and Google sign-in manually. Google requires the Google provider and `localhost` in authorized domains.

---

## Security checklist

- [ ] `.env.local` is not tracked by Git
- [ ] Service account JSON is **not** in the repo
- [ ] `GoogleService-Info.plist` / `google-services.json` are **not** copied into vedunya-web
- [ ] No secrets committed or pushed
- [ ] Flutter project (`mystic_app`) was not modified

---

## Related docs

- [firebase-web-setup.md](./firebase-web-setup.md) — general Firebase web architecture
- [../qa/live-firebase-auth-checklist.md](../qa/live-firebase-auth-checklist.md) — manual auth QA checklist
