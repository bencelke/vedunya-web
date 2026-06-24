# Firebase Auth providers — Vedunya Web / Mystic

Manual setup for Google, Apple, and Facebook sign-in. Do not commit secrets.

## Firebase Console

1. Open [Firebase Console](https://console.firebase.google.com/) → your Mystic project
2. **Authentication** → **Sign-in method**
3. Enable each provider you need

## Authorized domains

**Authentication** → **Settings** → **Authorized domains**

Add every hostname where the web app runs:

- `localhost` (local dev)
- `vedunya-web.vercel.app` (Vercel preview/production)
- `app.vedunya.com` (custom domain when live)

Missing domains cause `auth/unauthorized-domain` in the browser.

## Google

1. Enable **Google** in Sign-in method
2. Add support email
3. For Google OAuth on custom domains, also configure **Authorized JavaScript origins** in Google Cloud Console if required

Web app uses Firebase `GoogleAuthProvider` (popup or redirect on mobile/PWA).

## Apple

1. Enable **Apple** in Firebase Sign-in method
2. Apple Developer configuration is required:
   - Services ID
   - Return URL from Firebase (copy from Firebase Apple provider setup)
   - Sign in with Apple key (.p8) uploaded to Firebase
3. Add Apple return URL to Apple Developer → Identifiers → Services ID → Sign in with Apple

Web app uses `OAuthProvider("apple.com")` when `NEXT_PUBLIC_ENABLE_APPLE_LOGIN=true`.

## Facebook

1. Create a Meta app at [developers.facebook.com](https://developers.facebook.com/)
2. Add **Facebook Login** product
3. Enable **Facebook** in Firebase Sign-in method
4. Copy **App ID** and **App secret** into Firebase
5. In Meta app → Facebook Login → Settings, add Firebase **OAuth redirect URI** (from Firebase Facebook provider page)

Web app uses `FacebookAuthProvider` when `NEXT_PUBLIC_ENABLE_FACEBOOK_LOGIN=true`.

## Vercel env flags

Names only in `.env.example`:

```env
NEXT_PUBLIC_ENABLE_APPLE_LOGIN=
NEXT_PUBLIC_ENABLE_FACEBOOK_LOGIN=
```

Set to `"true"` only after the provider is enabled in Firebase and OAuth redirect/domain setup is complete.

Default (unset or not `true`): Apple and Facebook buttons are **hidden** — not shown as fake clickable buttons.

Google remains available when Firebase Web client is configured (no extra flag).

## Testing checklist

- [ ] Google sign-in on production HTTPS domain
- [ ] Apple sign-in only after Apple + Firebase setup and flag enabled
- [ ] Facebook sign-in only after Meta + Firebase setup and flag enabled
- [ ] Profile completion redirect after first social sign-in
- [ ] No `auth/unauthorized-domain` on Vercel hostname
