# Phase 12F — Disclaimer, legal, support, and trust pages parity

Prototype legal and trust surfaces for Vedunya Web / Mystic so Profile clearly links to disclaimer, privacy, terms, support, about, and data-deletion pages in EN and RU.

**This is prototype copy for testing, not attorney-reviewed legal text.**

## Flutter sources inspected (read-only)

| File | Purpose |
|------|---------|
| `lib/features/profile/mystic_app_info_screens.dart` | About, Privacy, Terms, Support screens |
| `lib/widgets/layout/mystic_static_content_screen.dart` | Shared static content layout |

Flutter was **not modified**.

## Web routes created

| Route | Page file |
|-------|-----------|
| `/[locale]/legal/disclaimer` | `src/app/[locale]/legal/disclaimer/page.tsx` |
| `/[locale]/legal/privacy` | `src/app/[locale]/legal/privacy/page.tsx` |
| `/[locale]/legal/terms` | `src/app/[locale]/legal/terms/page.tsx` |
| `/[locale]/support` | `src/app/[locale]/support/page.tsx` |
| `/[locale]/about` | `src/app/[locale]/about/page.tsx` |
| `/[locale]/account/data-deletion` | `src/app/[locale]/account/data-deletion/page.tsx` |

Shared UI:

- `src/features/trust/constants.ts` — `SUPPORT_EMAIL`, `TRUST_ROUTES`
- `src/features/trust/components/trust-page-shell.tsx` — App shell, title, back to Profile
- `src/features/trust/components/trust-section.tsx` — Card sections

## Profile links added

`ProfileLegalSection` links to all six trust routes via locale-aware `Link` from `@/i18n/navigation`.

`ProfileSupportSection` keeps `mailto:vedunyamaria@gmail.com` and adds a link to `/support`.

Labels (EN / RU):

- Disclaimer / Дисклеймер
- Privacy Policy / Политика конфиденциальности
- Terms of Use / Условия использования
- Support / Поддержка
- About / О приложении
- Data deletion / Удаление данных

## Page behavior

### Disclaimer

Clarifies Mystic is for reflection and spiritual practice only. States the app does not provide medical, legal, financial, psychological, or emergency advice. Required EN/RU copy from Phase 12F spec is in `legal.disclaimer`.

### Privacy

Prototype policy aligned with current architecture: Firebase auth/storage, profile/DOB/language, Universe Request, notification preferences, course progress, cookies/local storage, manual data deletion. Payments described as **not active** in the web prototype. No HIPAA/GDPR compliance claims.

### Terms

Plain-language prototype terms: reflection-only use, accounts, payments not active, content ownership, misuse, availability, limitation of responsibility, changes, contact. Includes lawyer-review note.

### Support

Topics: account, login, courses, notifications/PWA, Mystic Plus/payments note, data deletion. Contact: `vedunyamaria@gmail.com` with `mailto:` link. Link to data-deletion page.

### About

Mystic by Vedunya Maria — daily spiritual practice app. Calm positioning without grand psychic claims.

### Data deletion

Honest manual process: contact support from the account email. Automatic deletion is **not** claimed.

## Localization

Namespaces in `src/messages/en.json` and `src/messages/ru.json`:

- `legal.common`, `legal.disclaimer`, `legal.privacy`, `legal.terms`
- `support`, `about`, `dataDeletion`
- Updated `profile.legal`, `profile.support`

## Prototype vs lawyer-reviewed copy

All trust pages include a prototype notice (`legal.common.prototypeNote`). Content describes actual app behavior where known and avoids false compliance or payment claims. Full legal review is required before public launch.

## Tests added

`src/features/trust/tests/phase-12f-legal-support-trust-pages.test.ts`:

- Route existence and TrustPageShell usage
- EN/RU disclaimer, privacy, terms, support, about, data deletion copy
- Profile legal/support links and locale labels
- RU avoids EN fallback strings
- Forbidden claims scan (HIPAA, GDPR certified, guaranteed predictions, automatic deletion, payment active)

Updated `src/features/profile/tests/phase-12d-profile-settings-parity.test.ts` — legal section now links to trust routes instead of "Coming soon".

## Validation

Results (Phase 12F completion):

| Check | Result |
|-------|--------|
| `npm run assets:check` | Pass |
| `npm run lint` | Pass (1 pre-existing PWA warning) |
| `npm test` | Pass — 527 tests |
| `npm run build` | Pass — all trust routes in static output |
| `npm run verify:firebase` | Pass |
| `npm run content:check` | Pass |
| `npm run sanity:check` | Pass |
| `npm run courses:check` | Pass |

Run locally:

```bash
npm run assets:check
npm run lint
npm test
npm run build
```

Optional (when Firebase env is configured):

```bash
npm run verify:firebase
npm run content:check
npm run sanity:check
npm run courses:check
```

Manual QA URLs:

- `http://localhost:3000/ru/profile` and trust routes under `/ru/...`
- `http://localhost:3000/en/profile` and trust routes under `/en/...`

## Remaining gaps

- No in-app automated account deletion flow
- No attorney-reviewed privacy policy or terms
- Payment/subscription legal copy will need update when Mystic Plus checkout ships
- No dedicated disclaimer route in Flutter parity for separate "disclaimer" screen name (web combines disclaimer in legal section + dedicated page)

## Safe for Phase 12G?

**Yes**, for final prototype QA and route polish. Trust surfaces are present, honest, localized, and linked from Profile. Phase 12G can focus on cross-route QA, mobile polish, and deployment readiness without blocking on legal page creation.
