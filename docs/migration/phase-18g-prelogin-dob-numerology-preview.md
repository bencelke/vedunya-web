# Phase 18G — Pre-login DOB and numerology preview

## Final signed-out flow

```text
Intro carousel (4 pages)
→ First glimpse (general, non-personalized)
→ Date of birth (sessionStorage draft)
→ Numerology preview (DOB-based, local)
→ Create account / Log in
```

## Why DOB moved before login

Matches Mystic mobile pattern: users see personal value (numerology rhythm) before account creation, improving motivation to register while keeping data local until auth.

## Pre-auth DOB storage

- Key: `vedunya_preauth_onboarding_draft` in **sessionStorage only**
- Fields: `dateOfBirth` (YYYY-MM-DD), `locale`, `createdAt`
- Cleared after successful profile save
- Never written to Firestore before authentication

## Date picker

Native `<select>` for Day / Month / Year:

- Localized month labels
- Year range: current year → 1900
- Responsive grid: 3 columns ≥381px, stacked below
- `min-width: 0` prevents overflow
- iPhone Safari opens native wheel picker for selects

## Pre-login numerology preview

Uses existing `buildPersonalDayResult` (Sujok personal day engine + Phase 17 content). No AI. Copy clarifies this is a first personal glimpse; account needed to save DOB and receive daily guidance.

## Post-login behavior

| Case | Flow |
|------|------|
| New user + pre-auth DOB | Name → DOB confirm/edit → Language → Preview → Today |
| New user, no pre-auth DOB | Name → DOB → Language → Preview → Today |
| Existing user missing DOB | Name (if missing) → DOB → Language (if missing) → Preview → Today |
| Complete profile | Today |

Existing Firestore DOB is never overwritten by draft; draft only prefills when profile DOB is missing.

## Today protection

Unchanged: `displayName` + `language` + `user_private.dob` required. Incomplete → `/onboarding`.

## Tests

`phase-18g-prelogin-dob-numerology-preview.test.ts` — 16 cases.

## Manual QA

Not run in this session. Recommended incognito flow per Step 12 in task spec.

## Known gaps

- Pre-auth draft is per-tab sessionStorage (cleared when tab closes)
- Legacy Flutter `users.dob` without `user_private.dob` still requires signed-in DOB confirmation (18F1 behavior)
