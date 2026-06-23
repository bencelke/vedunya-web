# Phase 4 — Onboarding Parity

Web onboarding rebuilt to match Mystic Flutter step flow and light premium visual system, using Phase 2 theme and Phase 3 auth foundations.

---

## Flutter onboarding files inspected

| File | Notes |
|------|-------|
| `lib/features/onboarding/onboarding_flow.dart` | 5 steps: Welcome → Name → DOB → Preview → Account/Enter |
| `lib/features/onboarding/onboarding_locale_bar.dart` | EN/RU toggle in app bar |
| `lib/core/storage/onboarding_storage.dart` | Step index + name persistence |
| `lib/screens/auth_gate.dart` | Routes incomplete profiles to setup |

**Flutter step order:** Welcome, Name, DOB, Preview (guidance preview), Account choice (pre-auth) or Enter (in-app).

**Web adaptation:** Welcome → Name → DOB → Language → Ready. Preview step replaced with factual review summary (no fake AI reading). Account step omitted (web onboarding is post-auth at `/onboarding`).

---

## Web onboarding files created/modified

### Created

| Path | Purpose |
|------|---------|
| `src/features/onboarding/components/onboarding-flow.tsx` | Main 5-step flow |
| `src/features/onboarding/components/onboarding-shell.tsx` | Light page shell, no bottom nav |
| `src/features/onboarding/components/onboarding-progress.tsx` | Flutter-style progress dots |
| `src/features/onboarding/components/onboarding-step-card.tsx` | Step title/body layout |
| `src/features/onboarding/components/dob-input.tsx` | Date input with min/max + helper |
| `src/features/onboarding/components/onboarding-review.tsx` | Ready-step summary (no preview engine) |
| `src/features/onboarding/components/onboarding-error-message.tsx` | Friendly validation errors |
| `src/features/onboarding/utils/onboarding-draft.ts` | Session storage draft |
| `src/features/onboarding/utils/onboarding-error-map.ts` | Zod → error key mapping |
| `src/features/onboarding/tests/onboarding-parity.test.ts` | Focused parity tests |

### Modified

| Path | Change |
|------|--------|
| `src/app/[locale]/onboarding/page.tsx` | Import from onboarding feature |
| `src/features/auth/components/onboarding-flow.tsx` | Re-export shim |
| `src/messages/en.json`, `ru.json` | Polished onboarding + error copy |

**Unchanged:** `profile-bootstrap-service.ts` merge contract, `onboarding-schema.ts` date validation, `require-user.ts` redirects, deterministic engines.

---

## Step flow decision

| Step | Web | Flutter equivalent |
|------|-----|-------------------|
| 0 | Welcome + logo | `_WelcomePage` |
| 1 | Name (underline input) | `_NamePage` |
| 2 | DOB (native date picker) | `_DobPage` |
| 3 | Language EN/RU pills | (Flutter: app bar locale; separate language step removed in V2 flow) |
| 4 | Ready + review summary | `_EnterAppPage` / no preview |

Preview step intentionally **not** implemented — avoids misleading prediction language; full guidance loads on Today.

---

## DOB handling decision

- Input: HTML `type="date"` with `min="1900-01-01"` and `max=today` (local date).
- Storage: `YYYY-MM-DD` string validated by `dateOfBirthSchema`.
- Parse: `parseDateOfBirth` uses `new Date(year, month - 1, day)` — **local calendar parts, no timezone shift in string round-trip**.
- Firestore write: `Timestamp.fromDate(parsed)` in `user_private.dob` — existing contract preserved.
- Read-back: `profile-repository.ts` normalizes timestamp to local date parts.

---

## Firestore/profile contract decision

`completeUserProfile` unchanged:

- **Public `users/{uid}`:** merge `displayName`, `language`, `profileComplete: true` via `sanitizePublicProfilePatch` (protected fields stripped).
- **Private `user_private/{uid}`:** merge `dob`, `email`, `profileComplete: true`.
- Premium/admin/owner flags never written from onboarding UI.

---

## Localization changes

Premium calm EN/RU copy for welcome, DOB explanation (rhythm + personalization), language step, ready step, and validation errors (`auth.onboarding.errors.*`).

---

## Tests added/updated

`onboarding-parity.test.ts` — shell, steps, DOB round-trip, merge safety, redirects, copy, no premium field exposure.

---

## Remaining onboarding gaps

| Gap | Notes |
|-----|-------|
| Flutter Cupertino DOB wheel | Web uses native date picker |
| Guidance preview step | Deferred — product chose factual review instead |
| Pre-auth onboarding path | Web remains post-login only |
| Session step restore server-side | Web uses sessionStorage draft only |

---

## Next phase recommendation

**Phase 5 — Today screen full Mystic parity with premium/free content gating review.**
