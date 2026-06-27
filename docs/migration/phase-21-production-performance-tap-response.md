# Phase 21 — Production performance & tap response

## Symptoms (production mobile)

- Taps did not feel immediate on Vercel (`https://vedunya-web.vercel.app`)
- Buttons sometimes required double-tap
- Navigation felt sluggish compared to native app expectations
- Invisible waits after login/onboarding without feedback

## Bottlenecks found

### Main-thread / paint cost (mobile Safari)

- `backdrop-filter: blur(20px)` on bottom nav, header, and cosmic cards — expensive on mobile GPUs
- Fixed `position: fixed` Mystic background (`app-background.jpg`, ~304KB) on every app page — iOS repaints during scroll/tap
- Default 200ms button color transitions delayed perceived press feedback
- Missing `touch-action: manipulation` on interactive elements (300ms tap delay on older WebKit patterns)

### Navigation & data fetching

- `router.refresh()` after auth redirect and onboarding completion — extra full RSC round-trip before route transition felt complete
- Duplicate `/api/auth/profile-status` fetches from `auth-screen` and `onboarding-route` on the same session (no client dedupe)
- Bottom nav `Link` default prefetch could trigger heavy server renders for profile/plus/moon while on Today
- `/profile` and `/plus` had no route-level `loading.tsx` — blank wait during slow server fetches

### Tap feedback gaps

- Login/register forms reset `submitting` in `finally` even on success — button re-enabled before navigation
- Google/social buttons same pattern
- Logout had no pending state and called `router.refresh()` after sign-out
- Bottom nav had no immediate pending visual on tap

### Intentionally unchanged

- `router.refresh()` after universe request save (Today data must revalidate)
- `router.refresh()` after profile field save (RSC profile snapshot)
- `router.refresh()` after lesson complete
- Auth server gates (`force-dynamic` on protected routes) — security preserved
- Large moon/course assets not recompressed in this phase (visual quality preserved)

## Route / API observations

| Route / API | Notes |
|-------------|-------|
| `GET /ru/profile` | Heavy parallel server work (push, universe request, entitlements, settings) — benefits most from `loading.tsx` |
| `GET /ru/plus` | `force-dynamic` + entitlement lookup |
| `GET /ru/today` | `force-dynamic` (auth-gated) |
| `GET /api/auth/profile-status` | Called on post-login redirect; now cached/deduped client-side (30s TTL + inflight dedupe) |
| `POST /api/auth/session` | Already deduped per token in `session-service.ts` |
| `GET /api/auth/me` | Used by session sync; skips POST when UID already matches |

Vercel runtime logs were not captured in this pass (requires live phone traffic during `npx vercel logs`).

## Files changed

### New

- `src/features/auth/services/profile-status-cache.ts`
- `src/components/loading/mystic-route-loading.tsx`
- `src/app/[locale]/profile/loading.tsx`
- `src/app/[locale]/plus/loading.tsx`
- `src/features/today/tests/phase-21-production-performance-tap-response.test.ts`
- `docs/migration/phase-21-production-performance-tap-response.md`

### Updated

- `src/features/auth/components/auth-screen.tsx` — cached profile-status, removed refresh, redirecting UI
- `src/features/auth/components/login-form.tsx` — keep submitting on success
- `src/features/auth/components/register-form.tsx` — keep submitting on success
- `src/features/auth/components/social-auth-button.tsx` — keep submitting on success
- `src/features/onboarding/components/onboarding-route.tsx` — cached profile-status, removed refresh
- `src/features/onboarding/components/onboarding-flow.tsx` — removed refresh, invalidate cache on complete
- `src/features/profile/components/profile-content.tsx` — logout pending state, removed refresh on logout
- `src/features/profile/components/profile-logout-section.tsx` — disabled + submitting label
- `src/components/layout/bottom-navigation.tsx` — `prefetch={false}`, pending href feedback, touch/active states
- `src/components/ui/button.tsx` — faster transitions, active scale, touch-manipulation
- `src/features/premium/components/mystic-plus-paywall-link.tsx` — `prefetch={false}`
- `src/app/globals.css` — global touch-action, tap highlight
- `src/styles/mystic-theme.css` — mobile backdrop removal, non-fixed background, skeleton gold tint
- `src/messages/en.json`, `ru.json`, `de.json` — `profile.logout.submitting`

## Tap feedback improvements

- Buttons: 100ms transitions, `active:scale-[0.98]`, `touch-manipulation`
- Bottom nav: instant opacity/scale on tap, pending state until pathname arrives
- Login/register/Google: stay disabled after successful submit until unmount/redirect
- Logout: disabled + “Signing out…” label
- Auth redirect: full-screen loading shell while resolving profile-status + `router.replace`

## Auth call dedupe

- `fetchProfileStatusCached()` — 30s in-memory cache + single inflight promise
- Used by `auth-screen` and `onboarding-route`
- `invalidateProfileStatusCache()` on onboarding complete
- Session POST dedupe unchanged (already in `session-service.ts`)

## Route refresh changes

| Location | Before | After |
|----------|--------|-------|
| `auth-screen` post-login | `replace` + `refresh` | `replace` only |
| `onboarding-route` complete redirect | `replace` + `refresh` | `replace` only |
| `onboarding-flow` finish | `replace` + `refresh` | `replace` + cache invalidate |
| `profile-content` logout | `replace` + `refresh` | `replace` only |
| `universe-request-section` save | `refresh` | unchanged (needed) |
| `profile-content` save | `refresh` | unchanged (needed) |

## Image / background optimization

- No asset recompression (quality preserved)
- Mobile CSS: app background pseudo-elements use `position: absolute` instead of `fixed` to reduce iOS compositor cost
- Skeleton blocks use gold-tinted pulse via `.mystic-route-loading`

## Prefetch changes

- Bottom nav: `prefetch={false}` on all four tabs
- Mystic Plus paywall links: `prefetch={false}`

## Loading UI added

- `profile/loading.tsx` — Mystic profile skeleton
- `plus/loading.tsx` — Mystic paywall skeleton
- Reusable `MysticRouteLoadingSkeleton` component

## Tests added

`phase-21-production-performance-tap-response.test.ts` — 12 source-level assertions covering:

1. Login submit disable behavior
2. Google pending state
3. Onboarding double-click guard
4. Universe request duplicate submit guard
5. Bottom nav prefetch + pending feedback
6. Profile-status cache dedupe
7. Session dedupe
8. No accidental refresh on auth/onboarding/today idle paths
9. Profile/plus loading routes
10. Plus link prefetch disabled
11. Button touch/active CSS
12. Mobile backdrop-filter reduction

## Validation

| Check | Result |
|-------|--------|
| `npm run lint` | Pass (1 pre-existing PWA script warning) |
| `npm test` | **1009 passed** |
| `npm run build` | Pass (after CSS brace fix) |

## Manual QA checklist (local production)

Run `npm run build && npm run start`, mobile viewport 390–430px:

- [ ] `/ru/login` — email + Google show loading immediately
- [ ] `/ru/onboarding` — finish button disables once
- [ ] `/ru/today` — bottom nav taps feel instant
- [ ] `/ru/profile` — skeleton while loading, logout shows pending
- [ ] `/ru/plus` — skeleton while loading, CTA responds on first tap
- [ ] No horizontal scroll, no console errors

Re-test on phone after deploy.

## Known gaps

- Moon phase PNGs (157–504KB) and course covers (up to 2.2MB) not optimized in this phase
- `splash-screen.png` / `loading-makosh.png` (~1.3–1.4MB) not on critical tap path but heavy for PWA splash
- No runtime Web Vitals instrumentation added
- Vercel production route timing baseline not recorded (needs live traffic + logs)
- Profile save still uses `router.refresh()` (correct for RSC revalidation)

## Safety confirmations

- No commit
- No push
- No deploy
- No secrets printed
- `.env.local` untouched
- Flutter / `mystic_app` untouched
- Auth security gates unchanged
