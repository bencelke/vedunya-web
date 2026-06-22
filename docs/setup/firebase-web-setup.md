# Firebase Web Setup

Manual setup for Mystic by Vedunya Maria web authentication.

Do not commit real credentials. Use `.env.local` locally only.

## 1. Open the existing Mystic Firebase project

Use the same Firebase project as the production Flutter app so existing `users/{uid}` and `user_private/{uid}` documents remain compatible.

## 2. Register a Web App

1. Firebase Console → Project settings → Your apps
2. Add app → Web
3. Name it for Vedunya Maria web (for example `vedunya-web`)
4. Copy the Web SDK config values

## 3. Copy Web SDK config into `.env.local`

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## 4. Enable Email/Password provider

Authentication → Sign-in method → Email/Password → Enable

## 5. Enable Google provider

Authentication → Sign-in method → Google → Enable

Configure support email in the provider settings.

## 6. Add authorized domains

Authentication → Settings → Authorized domains

For local development add:

- `localhost`

Before production launch add:

- `app.vedunya.com`

## 7. Create Firebase Admin credentials

1. Firebase Console → Project settings → Service accounts
2. Generate new private key for a service account with permission to verify tokens and read/write Firestore as needed
3. Copy values into `.env.local` — never commit the JSON file

```env
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_SESSION_COOKIE_NAME=vedunya_session
```

Use `\n` escaped newlines in the private key string, or a single-line value with literal `\n` sequences.

## 8. Restart the development server

```powershell
npm run dev
```

## Architecture summary

- **Client:** Firebase Auth + Firestore in the browser
- **Server:** Firebase Admin verifies ID tokens and session cookies
- **Session:** `POST /api/auth/session` creates an HttpOnly cookie after ID token verification
- **Profile:** merge-safe writes to existing Mystic Firestore contracts

## Apple sign-in (later)

Apple Web authentication is not implemented in this phase. It requires Apple developer configuration, Firebase Apple provider setup, and a web-specific redirect/domain verification flow.

## Verification checklist

- [ ] Login page shows configuration message when env vars are absent
- [ ] Email registration creates session cookie
- [ ] Google sign-in works on localhost
- [ ] Existing Mystic user can sign in without profile data loss
- [ ] New user completes onboarding and writes `profileComplete` + `dob`
- [ ] `/api/auth/me` returns minimal session user only
