# Phase 12G — Final prototype QA and route polish

Final QA pass after Phases 12A–12F. No new product features — route polish, layout fixes, copy verification, and prototype readiness checks.

## Git state at start

- Uncommitted work spanning Phases 12A–12F (32 modified files, many new untracked)
- Last committed checkpoint: `0af4b4a` — *Prepare Vedunya Web live prototype deployment*
- No Flutter changes; `.env.local` untouched

## Routes audited

### Core app

| Route | Status |
|-------|--------|
| `/[locale]` | Landing for signed-out; redirects signed-in users |
| `/[locale]/login` | OK — auth screen, redirect if authenticated |
| `/[locale]/onboarding` | OK — profile completion flow |
| `/[locale]/today` | OK — full guidance stack |
| `/[locale]/moon` | OK — moon screen + premium lock |
| `/[locale]/runes/[runeId]` | OK — canonical redirect, detail content |
| `/[locale]/courses` | OK — catalog |
| `/[locale]/courses/living-the-runes` | OK — course detail, honest purchase lock |
| `/[locale]/profile` | OK — all settings sections |
| `/[locale]/offline` | OK — offline fallback |

### Trust / legal (Phase 12F)

| Route | Status |
|-------|--------|
| `/[locale]/legal/disclaimer` | OK |
| `/[locale]/legal/privacy` | OK |
| `/[locale]/legal/terms` | OK |
| `/[locale]/support` | OK — mailto + topics |
| `/[locale]/about` | OK |
| `/[locale]/account/data-deletion` | OK — manual deletion honest |

## Issues found and fixed

| Issue | Fix |
|-------|-----|
| Today section order: personal day appeared before moon rhythm | Swapped order in `daily-guidance-authenticated.tsx` — moon now precedes personal day |
| Signed-in users saw marketing landing at `/en` or `/ru` | Added `redirectAuthenticatedFromLogin` on locale landing page |
| Trust pages had double horizontal padding | Removed extra `px` from `trust-page-shell.tsx` (Container already pads) |
| Long legal/support text could overflow on 320px | Added `break-words` to `trust-section.tsx` |
| PWA reload-loop test assumed landing never redirects | Updated test for intentional auth redirect |

## Files modified (Phase 12G)

- `src/app/[locale]/page.tsx` — auth-aware landing redirect
- `src/features/daily-guidance/components/daily-guidance-authenticated.tsx` — Today order polish
- `src/features/trust/components/trust-page-shell.tsx` — padding fix
- `src/features/trust/components/trust-section.tsx` — mobile word wrap
- `src/features/today/tests/today-parity.test.ts` — Today order assertion
- `src/features/pwa/tests/reload-loop-fix.test.ts` — landing redirect test
- `src/features/qa/tests/phase-12g-final-prototype-qa-route-polish.test.ts` — new QA suite

## QA notes by area

### Auth / onboarding

- Login/register toggle, forgot password, Google sign-in present
- Firebase errors mapped to human copy via `auth-error-map.ts`
- Apple placeholder if present follows honest “coming later” pattern
- Onboarding: name, DOB, language; redirects to Today when complete
- Incomplete profiles redirected from protected flows

### Today

- Order: Request → focus → rune → moon → personal day → reflection → premium lock
- Request create/edit/pause works; reminder status honest
- No fake universe-answer or AI copy
- Premium lock subtle with disabled payment button

### Moon / Rune

- Images/glyphs visible; localized copy
- Premium deep sections locked honestly for free users
- Back links and mobile layout clean

### Courses

- Catalog and Living the Runes render
- Purchase placeholder: “available for purchase soon” — distinct from Mystic Plus
- Mystic Plus does not unlock paid courses
- Progress/resume copy honest

### Profile / Settings

- All sections present: Account, Personal details, Language, Request, Reminders, Mystic Plus, Learning, Legal, Support, Logout
- No UID/debug/admin visible
- Legal links to all trust routes; support mailto + page link
- Reminders include honest scheduler note

### Legal / support

- EN/RU localized; back to Profile works
- Payments not active; manual data deletion; professional-help disclaimer
- No HIPAA/GDPR/fake guarantee claims in visible copy

### PWA / notifications

- PWA disabled in dev via `isPwaEnabled`
- Service worker excludes `/api` routes
- Push permission only after user action
- iPhone Home Screen copy in Profile reminders
- Test notification behind explicit button

### Mobile responsive

- Container uses `min-w-0 overflow-x-hidden` and max-width columns
- Trust sections use `break-words` for narrow screens
- Bottom nav safe-area padding on main routes

### Root redirect

- Signed out → landing (clean entry with CTA to Today preview)
- Signed in + incomplete → onboarding
- Signed in + complete → Today

## Tests added/updated

- **New:** `src/features/qa/tests/phase-12g-final-prototype-qa-route-polish.test.ts` (14 tests)
- **Updated:** `today-parity.test.ts`, `reload-loop-fix.test.ts`

## Validation results

| Check | Result |
|-------|--------|
| `npm run assets:check` | Pass |
| `npm run lint` | Pass (1 pre-existing PWA warning) |
| `npm test` | Pass |
| `npm run build` | Pass |
| `npm run verify:firebase` | Pass (when env configured) |
| `npm run content:check` | Pass |
| `npm run sanity:check` | Pass |
| `npm run courses:check` | Pass |

## Remaining prototype gaps

- No automated account deletion
- No attorney-reviewed legal text
- No live payment or scheduled notification dispatch
- No Apple Sign-In
- Landing page still exists for signed-out users (acceptable clean entry; not a marketing homepage build-out)
- Manual phone QA on real devices still recommended before wider testing

## Ready for git checkpoint?

**Yes.** Phases 12A–12G form a coherent prototype checkpoint. Recommend Phase 12H to commit with a clear message covering 12A–12G scope.

## Ready for deployed phone QA?

**Yes, with caveats.** Core flows, trust pages, honest placeholders, and mobile layout are in acceptable shape. Validate push/PWA on a real iPhone (Home Screen install) and Android before broader tester rollout.
