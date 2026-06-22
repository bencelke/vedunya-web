# Mystic by Vedunya Maria — Web

Mobile-first daily guidance PWA for Vedunya Maria.

**Project path:** `C:\Users\1\development\vedunya-web`

## Product purpose

Mystic delivers calm, premium daily spiritual guidance with lunar rhythm context and one practical action per day. The web app preserves the existing Mystic Firebase user base and Firestore contracts.

## Tech stack

- Next.js 16 (App Router, TypeScript)
- Tailwind CSS 4
- next-intl (English + Russian)
- Firebase Auth + Firestore (client)
- Firebase Admin (server sessions)
- React Hook Form + Zod
- Vitest (focused unit tests)

## Installation

```powershell
npm install
```

Copy environment placeholders:

```powershell
copy .env.example .env.local
```

See `docs/setup/firebase-web-setup.md` for Firebase Console steps.

## Local development

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production build

```powershell
npm run build
npm run start
```

## Tests

```powershell
npm test
npm run verify:firebase
npm run numerology:check -- --dob=1990-03-15 --date=2026-06-13 --locale=en
npx tsx scripts/moon-check.ts --date=2026-06-13T12:00:00.000Z --timezone=UTC --locale=en
npx tsx scripts/rune-check.ts --dob=1990-03-15 --date=2026-06-13 --locale=en
```

## Today feature status

Unified daily guidance experience at `/[locale]/today`.

### Section order (authenticated, complete profile)

1. Header — brand, date, greeting, profile link
2. **Primary guidance** — personal-day focus, message, one action
3. Personal-day indicator — number, title, localized explanation (no duplicate summary)
4. Moon rhythm — compact phase + link to Moon page
5. Rune focus — symbol + summary (+ action only when different from primary)
6. Quiet reflection — optional `avoidAdvice` when distinct from primary

### User states

| State | Behavior |
|-------|----------|
| Anonymous | Labeled preview example + live Moon phase + sample rune + sign-in CTA |
| Incomplete profile | Single setup CTA to onboarding — no fake personal data |
| Authenticated complete | Full personalized guidance from existing engines |

### Architecture

- Loader: `src/features/daily-guidance/services/load-daily-guidance.ts`
- One session + profile read per request; parallel Moon/numerology/rune resolution
- Deterministic primary message from Sujok personal-day content (no AI synthesis)
- Route loading skeleton: `src/app/[locale]/today/loading.tsx`

See `docs/migration/today-composition-report.md` and `docs/migration/today-screen-audit.md`.

## Courses feature status

Living the Runes course migrated with Sanity catalog integration and local fallback.

### Routes

| Route | Purpose |
|-------|---------|
| `/[locale]/courses` | Course catalog |
| `/[locale]/courses/living-the-runes` | Course detail + lesson list |
| `/[locale]/courses/living-the-runes/lessons/[lessonId]` | Lesson reader |

### Identifiers

- Course ID: `runes_24_inner_strength`
- Slug: `living-the-runes`
- Product ID: `course_runes_24_inner_strength`
- Lessons: **28** (local runtime content)

### Architecture

- Catalog: Sanity GROQ → validated merge with `local-course-catalog.ts`
- Lesson bodies: ported Flutter content (`living-the-runes.generated.ts`)
- Progress: Firestore `users/{uid}/courseProgress/{courseId}`
- API: session-verified `POST .../progress/open` and `.../complete`

### Access (current stage)

- Paid course — **Premium alone does not unlock**
- Web checkout not implemented; catalog/detail remain visible with honest locked state
- Owner / super-admin server override for QA only

### Diagnostics

```powershell
npm run sanity:check
npm run courses:check
```

See `docs/migration/course-port-report.md`.

## Asset migration status

Production image assets are copied from the read-only Mystic Flutter project into `public/assets/` (copy-only — Flutter source files are never moved or modified).

```powershell
npm run assets:check
npx tsx scripts/migrate-flutter-assets.ts
```

See `docs/migration/full-asset-migration-report.md`.

**Never copy** font files, `.env` files, Firebase plist/json configs, or service account keys into `public/`.

## Moon feature status

- Synodic engine ported from `moon_engine_service.dart` (UTC-normalized Julian date)
- Four phase IDs: `new_moon`, `waxing`, `full_moon`, `waning`
- Lunar day: `floor(moonAgeDays) + 1`, clamped 1–30
- Firestore-first content: `moon_phases/{phase4Id}`, `lunar_days/{1-30}`
- Local phase fallback from `moon_phase_fallback_data.dart`
- Moon route: `/[locale]/moon` (public, dynamic)
- Authenticated Today shows Moon as a supporting rhythm section linking to Moon
- Assets: `public/assets/moon/phases/` (see `docs/migration/moon-asset-map.md`)

### Moon diagnostic

```powershell
npx tsx scripts/moon-check.ts --date=2026-06-13T12:00:00.000Z --timezone=Europe/Berlin --locale=en
```

## Rune feature status

- **Daily selection ported** from `rune_daily_service.dart` + `runes_collection.dart`
- **Not UID-based** — uses Sujok personal day + local date (`seed = PD×1009 + dayOfYear + month×31`)
- **Canonical ID `raido`** — `raidho` accepted only as legacy alias
- **Today uses local modular content** — no Firestore for the Today card
- **Detail uses Firestore-first** at `runes/{canonicalRuneId}` with local fallback
- **24 SVG assets** in `public/assets/runes/symbols/`
- Authenticated complete Today includes rune as supporting symbolic focus
- Rune detail route: `/[locale]/runes/[runeId]` (alias URLs redirect to canonical)
- Entitlement read-only from profile (no new billing)

### Rune diagnostic

```powershell
npm run rune:check -- --dob=1990-03-15 --date=2026-06-13 --locale=en
npx tsx scripts/rune-check.ts --dob=1985-11-29 --date=2026-01-01 --locale=en
```

## Numerology feature status

- **Today uses Sujok personal-day numerology** (not classical profile numerology)
- Flutter sources: `personal_day_numerology_service.dart`, `personal_day_guidance_dataset.dart`
- Web engine: `src/features/numerology/`
- Date-only DOB reads from `user_private/{uid}.dob`
- Deterministic copy: fixed EN/RU strings per digit 1–9 (no random variants in audited source)
- Authenticated complete users see personalized guidance on Today
- Anonymous users keep the public preview
- Incomplete profiles see a setup CTA (no fake personal-day number)

### Caching

Today personalized output uses `dynamic = "force-dynamic"` to avoid cross-user static cache contamination.

## Firebase verification

```powershell
npm run verify:firebase
npm run content:check
```

Live status (when `.env.local` is configured):

- `clientConfigured: true`
- `adminConfigured: true`
- `projectIdsMatch: true`
- Firestore + Auth Admin reachable (read-only checks)

Read-only diagnostic — no Firestore writes. Reports missing variable **names** only when credentials are absent.

### Auth diagnostics (development only)

After signing in locally, open:

```text
GET http://localhost:3000/api/dev/auth-diagnostics
```

Returns boolean profile/session status only. Returns **404 in production**.

### Manual auth QA

See `docs/qa/live-firebase-auth-checklist.md` and `docs/migration/live-firebase-auth-report.md`.

### Login test flow

1. `npm run dev`
2. Open `/en/login`
3. Sign in with an existing Mystic account (email or Google)
4. Complete users → `/en/today`; incomplete → `/en/onboarding`
5. Refresh to confirm session cookie persistence
6. Sign out from Profile and confirm protected routes redirect to login

Copy placeholders first:

```powershell
copy .env.example .env.local
```

Boris must add real Firebase Web and Admin values before live verification can pass.

## Firebase Web setup status

- Client SDK configured via `NEXT_PUBLIC_FIREBASE_*`
- Admin SDK configured via `FIREBASE_ADMIN_*`
- Secure HttpOnly session cookies via `/api/auth/session`
- No production Firebase deployment performed by this repo task

## Required client environment variables

```text
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## Required server environment variables

```text
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
FIREBASE_SESSION_COOKIE_NAME=vedunya_session
```

## Authentication providers

- Email/password registration and login
- Google sign-in (popup on desktop, redirect on mobile/PWA-like environments)
- Password reset email
- Apple sign-in: planned later (documented placeholder only)

## Secure session architecture

1. Browser signs in with Firebase Auth
2. Client sends verified ID token to `POST /api/auth/session`
3. Server verifies token with Firebase Admin and sets HttpOnly session cookie
4. Protected server pages use `verifySessionCookie()` — cookie presence alone is not trusted
5. Logout clears Firebase client auth and server cookie via `POST /api/auth/logout`

## Existing profile compatibility

- Public profile: `users/{uid}`
- Private profile: `user_private/{uid}`
- DOB stored as Firestore `Timestamp` in `user_private.dob`
- `profileComplete` on both docs when onboarding finishes
- Merge-safe bootstrap preserves premium/admin fields

## Onboarding flow

1. Welcome
2. Name
3. Date of birth
4. Language confirmation
5. Ready → Today

## Protected routes

| Route | Protection |
|-------|------------|
| `/[locale]/onboarding` | Server session required; incomplete profile only |
| `/[locale]/profile` | Server session required |
| `/[locale]/login` | Redirects authenticated users to Today or Onboarding |
| `/[locale]/today` | Public preview for guests; personalized Sujok guidance when signed in with complete profile |

## Localization

- Locales: `en`, `ru`
- Auth, onboarding, and profile copy live in `src/messages/*.json`

## Current limitations

- No PayPal, RevenueCat, Web Push, or service worker
- No admin panel
- No Card of the Day or tarot
- Apple Web sign-in not implemented
- Browser login requires manual QA with real Mystic accounts (see auth checklist)
- Rune deep affirmation/reflection fallback uses template strings when Firestore unavailable

## Recommended next step

Migrate the Living the Runes course, connect the Sanity course catalog, and preserve Firestore course progress.

## Related docs

- `docs/setup/firebase-web-setup.md`
- `docs/migration/data-contracts.md`
- `docs/migration/firestore-auth-rules-review.md`
- `docs/migration/web-build-roadmap.md`
- `docs/migration/numerology-port-report.md`
- `docs/migration/numerology-content-review.md`
- `docs/migration/moon-port-report.md`
- `docs/migration/moon-content-review.md`
- `docs/migration/moon-asset-map.md`
- `docs/migration/rune-port-report.md`
- `docs/migration/rune-today-content-review.md`
- `docs/migration/rune-deep-content-review.md`
- `docs/migration/rune-asset-map.md`
- `docs/migration/today-screen-audit.md`
- `docs/migration/today-composition-report.md`
- `docs/migration/today-asset-map.md`
- `docs/migration/live-firebase-auth-report.md`
- `docs/qa/live-firebase-auth-checklist.md`
