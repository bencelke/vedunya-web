# Firestore Auth Rules Review

Read-only review of `C:\Users\1\development\mystic_app\firestore.rules` against the new Vedunya web authentication and profile flows.

No rules were deployed or modified.

## Web app operations required

| Operation | Path | Expected result |
|-----------|------|-----------------|
| Read own public profile | `users/{uid}` | Allowed when signed in |
| Create own public profile shell | `users/{uid}` | Allowed on first sign-in (`uid` must match auth uid) |
| Update owner-safe profile fields | `users/{uid}` | Allowed for keys in `ownerSafeUserFieldKeys()` |
| Read own private profile | `user_private/{uid}` | Allowed for owner |
| Write own private profile | `user_private/{uid}` | Allowed for owner (includes `dob`, `email`, `profileComplete`) |

## Owner-safe public fields (client may update)

From Firestore rules:

- `uid`
- `displayName`
- `username`, `usernameNormalized`
- `bio`, `photoUrl`
- `language`
- `updatedAt`, `lastSeenAt`
- `primaryInstallationId`, `recentInstallationIds`
- `profileComplete`
- notification preference fields

The web bootstrap/update layer only writes a subset of these during auth and onboarding.

## Protected public fields (client must never modify)

From `adminModerationUserFieldKeys()` and premium/admin flags:

- `role`, `accountType`, `accountState`, `moderation`
- `isVerified`, badge fields
- `isAdmin`, `isOwner`
- `premiumOverride`, `isPremium`
- `postsCount`, `commentsCount`

The web app sanitizes patches through `sanitizePublicProfilePatch()` and never includes these keys.

## Compatible today

- Email/password and Google sign-in with client Firestore bootstrap
- Onboarding completion writing:
  - `users/{uid}`: `displayName`, `language`, `profileComplete`, timestamps
  - `user_private/{uid}`: `dob` as Firestore `Timestamp`, `email`, `profileComplete`
- Profile edits for name, DOB, and language
- Server session verification via Firebase Admin (rules-independent)

## Blocked or risky from the web client

| Operation | Why |
|-----------|-----|
| Writing `email`, `authProviders`, `lastLoginAt` to `users/{uid}` on update | Not in `ownerSafeUserFieldKeys()` — web bootstrap avoids these on update |
| Writing premium/admin fields | Blocked by rules and by web sanitization |
| Reading another user's private profile | Denied by rules |
| Updating another user's public profile | Denied by rules |
| Client access to `app_settings`, `feature_flags` | Denied by catch-all rules |

## Existing Flutter bootstrap note

The Flutter `UserBootstrapService` attempts to merge `email`, `authProviders`, and `lastLoginAt` into `users/{uid}` on update. Firestore rules may reject those keys on update. The web implementation avoids writing non-owner-safe keys on update and keeps sensitive email data in `user_private/{uid}`.

## Minimum future rule changes (do not deploy yet)

1. **Optional:** explicitly allow owner merge of `authProviders` and `lastLoginAt` on `users/{uid}` if product wants parity with Flutter bootstrap on public docs.
2. **Before remote feature flags:** add explicit read rules for `app_settings/*` and `feature_flags/global` for staff clients or move reads to Admin SDK only.
3. **Before web admin UI:** enforce custom claims server-side; keep Firestore moderation keys admin-only.

## Recommended deployment order

1. Deploy web auth/profile client with current rules (compatible for onboarding path)
2. Verify production sign-up/login against staging Firebase project
3. Add Admin-only settings reads if needed
4. Add custom claims + admin API before any web admin panel
5. Review whether public `users.email` should remain writable or be private-only everywhere

## Security principle

Session cookies prove identity to Next.js server routes. Firestore writes still require a valid Firebase Auth ID token on the client SDK. Protected pages must verify the session server-side; cookie presence alone is insufficient.
