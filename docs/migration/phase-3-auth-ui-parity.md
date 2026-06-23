# Phase 3 — Auth UI Parity

Rebuild of Vedunya Web authentication to match Mystic Flutter light auth experience, using the Phase 2 theme foundation.

---

## Flutter auth files inspected

| File | Notes |
|------|-------|
| `lib/screens/welcome_auth_screen.dart` | White page, MYSTIC wordmark, logo, headline, gold divider, register primary + sign-in outline, EN/RU pill toggle |
| `lib/screens/login_screen.dart` | Email/password underline fields, gold CTA, link to register |
| `lib/screens/register_screen.dart` | Same input style, create account CTA, link to login |
| `lib/shared/widgets/auth/auth_entry_theme.dart` | `mysticAuthInputDecoration` — underline borders, gold focus |
| `lib/core/i18n/auth_localizations.dart` | EN/RU auth strings |
| `lib/services/auth_service.dart` | Email/password only in production screens |

**Not copied from Flutter:**
- Separate welcome route (web keeps combined login/register on `/login` — safer for existing routing)
- Google/Apple on welcome (Flutter production auth screens use email only; web keeps Google as working enhancement)
- Forgot password (web-only feature, styled to match light auth)

---

## Web auth files modified

### Created

| Path | Purpose |
|------|---------|
| `src/features/auth/components/auth-brand-header.tsx` | Wordmark, logo, headline, gold divider |
| `src/features/auth/components/auth-provider-buttons.tsx` | Google + Apple group |
| `src/features/auth/components/auth-form-card.tsx` | Form vertical rhythm wrapper |
| `src/features/auth/components/auth-shell.tsx` | Re-export from UI shell |
| `src/features/auth/components/auth-language-bar.tsx` | Re-export with Flutter-style toggle |
| `src/features/auth/tests/auth-ui-parity.test.ts` | Focused auth parity tests |

### Modified

| Path | Change |
|------|--------|
| `src/features/auth/components/auth-screen.tsx` | Brand header, provider buttons, flat page layout |
| `src/features/auth/components/login-form.tsx` | Underline inputs, AuthFormCard |
| `src/features/auth/components/register-form.tsx` | Underline inputs, AuthFormCard |
| `src/features/auth/components/forgot-password-form.tsx` | Underline inputs, success state styling |
| `src/features/auth/components/google-sign-in-button.tsx` | `mysticAssets` reference |
| `src/features/auth/components/apple-sign-in-placeholder.tsx` | Clear disabled copy, no fake icon handler |
| `src/app/[locale]/forgot-password/page.tsx` | AuthBrandHeader + flat shell |
| `src/components/ui/auth-shell.tsx` | `layout="page"` default (no card box) |
| `src/components/ui/input.tsx` | `variant="underline"` for auth fields |
| `src/components/layout/auth-language-bar.tsx` | Flutter gold-border locale pill |
| `src/styles/mystic-theme.css` | Auth wordmark, divider, underline input, lang toggle |
| `src/messages/en.json`, `ru.json` | Polished auth copy |

**Unchanged (by design):**
- `auth-service.ts`, `session-service.ts`, API routes
- Firebase config, Firestore contracts
- `auth-error-map.ts` logic
- Redirect helpers in `lib/auth/`

---

## Visual parity decisions

| Flutter | Web Phase 3 |
|---------|-------------|
| White scaffold, no card | `mystic-auth-page` + `layout="page"` |
| Underline inputs | `Input variant="underline"` + `.mystic-auth-input-underline` |
| Gold pill locale toggle | `.mystic-auth-lang-toggle` + active gold chip |
| MYSTIC wordmark + logo | `AuthBrandHeader` |
| Gold hairline divider | `.mystic-auth-divider` |
| Pill primary CTA | `Button variant="authPrimary"` |
| Outlined secondary | `Button variant="authOutline"` for Google |

---

## Auth flow decisions

- **Combined `/login` route** preserved with login ↔ register toggle (no new routes).
- **Post-auth redirect** unchanged: profile complete → `/today`, incomplete → `/onboarding`.
- **Forgot password** at `/forgot-password` (web enhancement).
- **Back to home** link retained on login (web landing entry).

---

## Apple sign-in decision

Apple is **not configured on web**. Button remains visible but **disabled** with copy:
- EN: "Apple sign-in coming later"
- RU: "Вход через Apple скоро появится"

No fake `signInWithApple` call. `aria-disabled` + `title` hint for accessibility.

---

## Google sign-in decision

Existing `loginWithGoogle()` + session cookie flow **preserved**. Button uses outlined pill style with Google G icon from `mysticAssets.brand.googleIcon`.

---

## Firebase error mapping

`mapFirebaseAuthError` unchanged. UI shows `auth.errors.*` translations via `AuthErrorMessage` — no raw `auth/` codes exposed to users.

---

## Localization changes

Premium calm tone in EN/RU:
- Welcome headline references "Mystic by Vedunya Maria"
- Login subtitle focuses on continuing daily guidance / practice
- Forgot password headings aligned
- Apple placeholder clearly states coming later

---

## Tests added/updated

`src/features/auth/tests/auth-ui-parity.test.ts` — 20+ focused tests for shell, providers, inputs, errors, copy, nav scope, redirects.

Existing `auth-foundation.test.ts`, `mystic-ui-parity.test.ts`, engine tests unchanged.

---

## Remaining auth gaps

| Gap | Phase |
|-----|-------|
| Separate welcome screen before login (Flutter `WelcomeAuthScreen`) | Optional polish |
| Apple Sign-In web configuration | Future release |
| Guest / continue-without-account | Not in web V1 |
| Terms/privacy published URLs | Pre-launch legal |
| Register via dedicated route / query param | Optional |

---

## Next phase recommendation

**Phase 4 — Onboarding parity using the new auth/theme foundation.**

Preview step, account choice alignment, progress feel, and Firestore field parity without changing contracts.
