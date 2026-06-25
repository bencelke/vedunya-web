# Phase 18A — Intro onboarding visual polish

Premium white/gold first-run intro onboarding for signed-out users.

## Flutter files inspected (read-only)

| File | Borrowed structure |
|------|-------------------|
| `lib/features/onboarding/onboarding_flow.dart` | Top language bar, progress dots, back after page 1, vertical spacers, gold primary CTA |
| `lib/screens/welcome_auth_screen.dart` | Calm headline + body rhythm |
| `lib/screens/login_screen.dart` | White auth shell, centered content |
| `lib/screens/auth_gate.dart` | Pre-auth routing |

Flutter was **not modified**.

## Web files changed

- `src/features/onboarding/components/intro-onboarding-flow.tsx` — layout rewrite
- `src/features/onboarding/components/intro-onboarding-highlights.tsx` — feature chip row
- `src/features/onboarding/components/onboarding-step-card.tsx` — headline scale
- `src/styles/mystic-theme.css` — `.mystic-intro-*` layout utilities
- `src/messages/en.json`, `src/messages/ru.json` — intro copy + highlights
- `src/features/onboarding/tests/phase-18a-intro-onboarding-polish.test.ts`
- `src/features/auth/tests/phase-16b-first-run-onboarding-auth-parity.test.ts` — copy expectations

## Visual improvements

- Centered intro frame (`max-width ~552px`) with vertical stage slightly above center
- Fuller panel padding (24–44px) and gold-tinted card border/shadow
- Brand block on every page (compact logo on pages 2–4)
- Gold divider under logo on page 1
- Feature highlight chips per page (moon / rune / number, etc.)
- Footer brand note; skip-to-login on pages 1–3

## Copy

Human RU/EN per product brief — see `auth.intro.pages.*` in messages.

## CTA routing (unchanged)

- **Log in** → `/login`
- **Create account** → `/login?mode=register`
- **Skip** → `/login` (marks intro seen)

## Tests

`phase-18a-intro-onboarding-polish.test.ts` — copy, progress, back button, final CTAs, routing.

## Manual QA

```bash
npm run dev
# http://localhost:3000/ru
# http://localhost:3000/en
```

Check premium spacing, RU/EN fit, mobile width, language toggle, final CTAs.
